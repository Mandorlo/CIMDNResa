const dbapi = require('../db.js')
const invoice = require('../invoice/invoice.js')
const param = require('../param/param.js')
const resa = require('./resa.js')

const TABLES = [{
  id: 'R',
  name: 'Reservation',
  fields: {
    label: 'Rs_libellereservation',
    numresa: 'Rs_coderesa',
    numhisto: '',
    pax: 'Rs_effectif',
    etat: 'Rs_codeetat'
  }
}, {
  id: 'EH',
  name: 'ReservationEspaceHistorique',
  fields: {
    numresa: 'Res_numresa',
    numhisto: 'Res_numhisto',
    pax: 'Res_nbpers'
  }
}, {
  id: 'RPH',
  name: 'ReservationPrestationHistorique',
  fields: {
    numresa: 'Rp_coderesa',
    numhisto: 'Rp_numhisto',
    pax: '',
    pax_fact: 'Rp_effectif',
    comment: 'Rp_commentaireinterne'
  }
}]

async function test(a,b,c) {
  return a+b+c
}

async function closeResa(numresa, opt) {
  // cloture le dossier numresa
  // opt : {facture, voucher, refac}
  // si payé par donation, alors opt.facture doit = 'donation'
  if (!opt || !opt.facture) return {
    errnum: 'INVALID_PARAM',
    fun: 'service > updateResa > closeResa',
    details: `invalid @opt argument in closeResa(${numresa}, ${JSON.stringify(opt)}). @opt must be an obj with these attr at least : 'facture'`
  }

  // == 0 == checks if numresa is already closed
  let etat = await resa.getState(numresa)
  if (etat != param.resa.etat.CONFIRME) return {
    errnum: 'DOSSIER_NOT_READY',
    fun: 'service > updateResa > closeResa',
    details: `le dossier n'est pas prêt à être fermé ou est déjà fermé (code etat = ${etat})`
  }

  // == 1 == checks if facture and refac are stored in the network
  let year_fact = invoice.factnum2year(opt.facture)
  let factexists = await invoice.factureExists(opt.facture, year_fact)
  if (opt.facture != 'donation' && !factexists.val) return {
    errnum: 'FACT_NOT_SAVED_IN_NAS',
    fun: 'service > updateResa > closeResa',
    details: `La facture ${opt.facture} de l'annee ${year_fact} n'a pas été enregistrée sur le réseau (ici : ${param.network.default_frat_dir}${year_fact})`
  }
  if (opt.refac) {
    let year_refac = invoice.factnum2year(opt.refac)
    if (Math.abs(year_refac - year_fact) > 1) {
      return {
        errnum: 'FACT_REFACT_YEAR_DIFF',
        fun: 'service > updateResa > closeResa',
        details: `L'année ${year_fact} de facturation et l'année ${year_refac} de refacturation sont trop éloignées (>1) !`
      }
    }
    let refacexists = await invoice.factureExists(opt.refac, year_refac)
    if (!refacexists.val) return {
      errnum: 'REFAC_NOT_SAVED_IN_NAS',
      fun: 'service > updateResa > closeResa',
      details: `La re-facture ${opt.refac} de l'annee ${year_refac} n'a pas été enregistrée sur le réseau (ici : ${param.network.default_cimdn_dir}${year_fact})`
    }
  }

  // == 2 == if no refac, checks that no need for refac
  if (!opt.refac) {
    let is_refacturable = await invoice.dosssierIsRefacturable(numresa)
    if (is_refacturable && opt.facture != 'donation') return {
      errnum: 'NO_REFAC_NUM_PROVIDED',
      fun: 'service > updateResa > closeResa',
      details: `Le dossier ${numresa} doit être refacturé mais aucun numéro de refacturation n'a été trouvé en paramètre (dans opt.refac)`
    }
    else if (is_refacturable) console.log(`WARNING in closing resa ${numresa} : le dossier est refacturable mais a été payé par donation`)
  }

  // == 3 == updates the reservation in the IREC DB to 'close' it
  let r = await closeResaCore(numresa, opt)
  return true
}

// private core function used by closeResa
async function closeResaCore(numresa, opt) {
  let comment = (opt.facture && opt.facture != 'donation') ? `@facture : ${opt.facture}`: '';
  comment =     (opt.voucher)               ? `${comment}\n@voucher : ${opt.voucher}`   : comment;
  comment =     (opt.refac)                 ? `${comment}\n@refac : ${opt.refac}`       : comment;
  let etat =    (opt.facture == 'donation') ? param.resa.etat.DONATION: param.resa.etat.FACT_EMISE; // les codes sont dans la table "EtatDossier"

  console.log('closeresacore', comment)
  let fields = {
    comment,
    etat
  }

  let res = await updateResa(numresa, fields)
}

async function updateResa(numresa, fields) {
  let types = {
    'label': 'string',
    'pax': 'number',
    'pax_fact': 'number',
    'comment': 'string',
    'etat': 'number'
  }
  let results = []
  numresa = resa.cleanDossierNum(numresa)

  for (let table of TABLES) {
    let values = []
    for (let f in fields) {
      if (table.fields[f]) {
        let quotes = (types[f] == 'string') ? "'" : "";
        if (f == 'comment') {
          if (fields[f] == '') {
            values.push(`${table.fields[f]} = null`);
            values.push(`Rp_commentaireinternertf = '{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang1036{\\fonttbl{\\f0\\fswiss\\fprq2\\fcharset0 Trebuchet MS;}}{\\*\\generator Riched20 10.0.16299}\\viewkind4\\uc1\\pard\\f0\\fs17}'`)
          } else {
            values.push(`${table.fields[f]} = ${quotes}${fields[f]}${quotes}`);
            values.push(`Rp_commentaireinternertf = '{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang1036{\\fonttbl{\\f0\\fswiss\\fprq2\\fcharset0 Trebuchet MS;}}{\\*\\generator Riched20 10.0.16299}\\viewkind4\\uc1\\pard\\f0\\fs17 ${fields[f].replace(/[\n\r]+/g,'\\par')} }'`)
          }
        } else {
          values.push(`${table.fields[f]} = ${quotes}${fields[f]}${quotes}`)
        }
      }
    }
    if (values.length) {
      let ifnumhisto = (table.fields.numhisto) ? ` AND ${table.fields.numhisto} = 0` : '';
      let query = `UPDATE ${table.name} SET ${values.join(', ')} WHERE ${table.fields.numresa} = '${numresa}'${ifnumhisto}`
      if (fields.simulation) console.log(query);
      else {
        let res = await dbapi.query(query, true)
        results.push(res)
      }
    }
  }

  dbapi.close()
  return results
}

module.exports = {
  updateResa: updateResa,
  closeResa: closeResa,
  test: test
}

// closeResa('TC02914*01', {facture:'18010', voucher: '123', refac: 'F 8018'}).then(r => console.log(r)).catch(e => console.log('ERROR', e))

// updateResa('TC02914*01', {
//   pax: 2,
//   pax_fact: 1,
//   // comment: '',
//   comment: '@facture : F 18070\n@voucher: 2018-253\n@refac: F 8018',
//   simulation: false
// }).then(r => console.log(r)).catch(e => console.log('ERROR', e))
