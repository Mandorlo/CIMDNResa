// this module tries to find the guides and stats on them

const fs = require('fs')
const path = require('path')
const log = require('../log/log.js')
const dbapi = require('../db.js')
const util = require('../util/util.js')

const guides_path = path.join(__dirname, 'guides.json')
let GUIDES = require('./guides.json')

const QUERIES = {
  espace: `SELECT Res_numresa, Res_date, Res_nbpers, Res_besinterne, Res_besexterne
              FROM ReservationEspace
              WHERE Res_besinterne IS NOT NULL OR Res_besexterne IS NOT NULL`,
  prestation: `SELECT Rp_coderesa, Rp_effectif, Rp_commentaireinterne, Rp_commentaireexterne
              FROM ReservationPrestation
              WHERE Rp_commentaireinterne IS NOT NULL OR Rp_commentaireexterne IS NOT NULL`
}

const MODELS = {
  espace: {
    '_filter': (el) => /[0-9]{7,}/gi.test((el['Res_besinterne'] + el['Res_besexterne']).replace(/[\s\-\_]/g, '')),
    'id': 'Res_numresa',
    'date': 'Res_date',
    'pax': 'Res_nbpers',
    'comment': cleanComment
  },
  prestation: {
    '_filter': (el) => /[0-9]{7,}/gi.test((el['Rp_commentaireinterne'] + el['Rp_commentaireexterne']).replace(/[\s\-\_]/g, '')),
    'id': 'Rp_coderesa',
    'pax': 'Rp_effectif',
    'comment': cleanComment
  }
}

// recherche dans la base les guides qui sont venus et met à jour la base
async function updateGuideDB() {
  let [res_espace, res_prestation] = await Promise.all([dbapi.queryModel(QUERIES.espace, MODELS.espace), dbapi.queryModel(QUERIES.prestation, MODELS.prestation)])
  dbapi.close()
  let ids = GUIDES.map(g => g.phone)
  for (let res of res_espace) {
    let tel = getPhone(res.comment)
    let ind = ids.indexOf(tel)
    if (tel && ind < 0) {
      let guide = {
        firstname: '',
        name: '',
        remarks: '',
        phone: tel,
        comments: [res.comment],
        refs: [res.id],
        dates: [res.date],
        pax: [res.pax]
      }
      ids.push(tel)
      GUIDES.push(guide)
    } else if (tel && ind >= 0 && ind < GUIDES.length && !GUIDES[ind].refs.includes(res.id)) {
      GUIDES[ind].comments.push(res.comment)
      GUIDES[ind].refs.push(res.id)
      GUIDES[ind].dates.push(res.date)
      GUIDES[ind].pax.push(res.pax)
    }
  }

  // on essaie de deviner les noms des guides
  for (let i = 0; i < GUIDES.length; i++) {
    let guide = GUIDES[i]
    if (!guide.firstname && !guide.name) {
      let guessed_name = guessNames(guide)
      if (guessed_name.firstname) {
        guide.firstname = guessed_name.firstname
        guide.name = (guessed_name.name) ? guessed_name.name : ''
      }
    }
  }

  writeGUIDES()
  // fs.writeFileSync('./test.json',JSON.stringify(r, null, '\t'))

  return GUIDES.length
}

// returns the phone number from the comment string
function getPhone(s) {
  let clean_s = s.replace(/[^a-z0-9\/]/gi, '')
  let re = /[0-9]{9,}/gi.exec(clean_s)
  if (!re || re[0].length > 15) return ''
  let phone = re[0]
  if (phone.length > 12 && /^(\+|00)972([0-9]+)$/.test(phone)) phone = '0' + /^(\+|00)972([0-9]+)$/.exec(phone)[2];
  return phone
}

function cleanComment(el) {
  let s = (el['Res_besinterne']) ? el['Res_besinterne'] : '';
  s = (el['Res_besexterne']) ? s + el['Res_besexterne'] : s;
  s = (el['Rp_commentaireinterne']) ? s + el['Rp_commentaireinterne'] : s;
  s = (el['Rp_commentaireexterne']) ? s + el['Rp_commentaireexterne'] : s;

  return s.trim().replace(/[ \t]+/g, ' ').replace(/\*\*\*[^\*]+\*\*\*/g, '')
}

// renvoie le nom et prénom du guide à partir de l'objet @guide
function guessNames(guide) {
  if (guide.comments.length < 3) return {}
  let forbidden = ['the', 'and', 'him', 'her', 'priest', 'les', 'des', 'fr.', 'for', 'que', 'pour', 'group', 'groupe', 'from', 'pax',
    'ils', 'elles', 'you', 'menu', 'are', 'with', 'dessert', 'visit', 'visite', 'video', 'videos', 'père', 'father'
  ]
  let words = []
  let scores = []
  for (let c of guide.comments) {
    let mots = c.split(/[\s\:]+/g)
    for (let mot of mots) {
      mot = mot.toLowerCase().replace(/[\(\)\[\]]/gi, '')
      if (mot.length > 2 && !forbidden.includes(mot) && /[A-z]/gi.test(mot) && !/g+u+i+d+e+/gi.test(mot)) {
        let ind = words.indexOf(mot)
        if (ind >= 0) scores[ind]++;
        else {
          words.push(mot)
          scores.push(1)
        }
      }
    }
  }

  let ecart_type = Math.pow(scores.square().mean() - Math.pow(scores.mean(), 2), 0.5)
  let maxi = Math.max(...scores)
  let filtered_words = words.filter((el, i) => scores[i] >= maxi - 2 * ecart_type)

  if (ecart_type > 0.5 && filtered_words.length && filtered_words.length < 4) return {
    firstname: filtered_words[0],
    name: filtered_words.slice(1).join(' ')
  }
  else return {}
}

// renvoie la liste des guides correspondant à la requête @q
function query(q = null) {
  if (!q) return GUIDES
}

function updateField(guide_phone, field, val) {
  if (!guide_phone || !field || val === null) return -1;
  if (!['firstname', 'name', 'phone'].includes(field)) return -2;
  if (!GUIDES.filter(g => g.phone == guide_phone)) return -3;
  for (let i = 0; i < GUIDES.length; i++) {
    if (GUIDES[i].phone == guide_phone) {
      GUIDES[i][field] = val;
      writeGUIDES()
      return 1
    }
  }
  return -4
}

function writeGUIDES() {
  try {
    fs.writeFileSync(guides_path, JSON.stringify(GUIDES, null, '\t'), 'utf8')
    return 1
  } catch (e) {
    log.write('ERROR', 'stats > guides.js > writeGUIDES', JSON.stringify(e))
    return -1
  }
}

module.exports = {
  get: query,
  updateDB: updateGuideDB,
  getPhone: getPhone
}

// updateGuideDB().then(r => {
//   console.log(r, ' guides')
// }).catch(e => console.log('err', e))
