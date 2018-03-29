/*
 * In this module we retrieve the events from IREC/GTS
 * and parse them to be ready for sync with Google Calendar
 */

const fs = require('fs')
const path = require('path')
const moment = require('moment')
const dbapi = require('../db.js')

const TMP_FOLDER = path.join(__dirname, 'tmp')
const DEBUG = true

let QUERY_FUTURE_RESA = ` SELECT
                              Rs_coderesa, Rs_datedebut, Rs_codelangue, Rs_libellereservation, Rs_nomliv, Rs_commentaire,
                              Res_codeespace, Res_codetheme, Res_date, Res_heure, Res_heurefin, Res_nbpers, Res_besinterne
                          FROM Reservation
                          LEFT JOIN ReservationEspace ON Res_numresa = Rs_coderesa
                          WHERE
                              (Rs_codeetat = 1 OR Rs_codeetat = 2)
                              AND Rs_datedebut >= '@today'
                          ORDER BY Rs_datedebut`

let MODEL_FUTURE_RESA = {
  'dossier': 'Rs_coderesa',
  'agence': 'Rs_nomliv',
  'groupe': 'Rs_libellereservation',
  'lang': 'Rs_codelangue',
  'espace': 'Res_codeespace',
  'theme': 'Res_codetheme',
  'pax': 'Res_nbpers',
  'date': 'Res_date',
  'heure': {
    'debut': 'Res_heure',
    'fin': 'Res_heurefin'
  },
  'comment': 'Res_besinterne'
}

let EVENT_LABELS = {
  'Full Visit': /^FOUSMMCHA$/,
  'Excav + Show': /^FOUSMM$/,
  'Fouilles': /^FOU/,
  'Show': /^SMM/,
  'Messe': /^CHA102$/,
  'Chapelle visite': /^CHA101$/,
  'Chapelle prière': /^CHA103$/,
  'Terrasses/jardins': /^JAR/,
  'Déjeuner': (ev) => (/^CAF30[23]$/.test(ev.espace+ev.theme) && (parseInt(ev.heure.debut.substr(0,2)) <= 16)), // /^CAF302$/,
  'Dîner': /^CAF30[23]$/, // CAF303
  'Pause café': /^CAF304$/,
  'Ptidéj': /^CAF301$/,
  'Location Caféteria': /^CAF002$/,
  'Location de salle': /^AUD002$/,
  'Marie dans le monde': /^MDM/,
  'Location salle': /^AUD2$/,
  'Visite/divers': /^MDN001$/,
  'Visite de Nazareth': (ev) => (ev.espace == 'MDN' && /ophir/gi.test(ev.agence)),
  'Concert': /^AUD202$/
}

let EVENT_COLORS = {
  '3': /^CHA102$/,
  '10': /^CAF/,
  '8': /^(AUD|MDM)/,
  '7': (ev) => (ev.espace == 'MDN' && /ophir/gi.test(ev.agence)),
  '__DEFAULT__': '1'
}

//getFutureEvents().then(r => console.log(`ok got ${r.length} events from GTS`)).catch(e => console.log(e, "ERROR"))

async function getFutureEvents() {
  // on récupère les événements des réservations futures (cf MODEL_FUTURE_RESA)
  let gts_events = await getGTSFutureEvents()
  if (DEBUG) fs.writeFile(path.join(TMP_FOLDER, '10_gts_events.json'), JSON.stringify(gts_events, null, '\t'), 'utf8', _ => 1)
  // on merge les événements qui se suivent FOU puis SMM puis messe
  let merged_events = collapse(gts_events, tobemerged3, merge3)
  // on merge les événements qui se suivent FOU puis SMM
  merged_events = collapse(merged_events, tobemerged2, merge2)
  if (DEBUG) fs.writeFile(path.join(TMP_FOLDER, '20_gtsmerged_events.json'), JSON.stringify(merged_events, null, '\t'), 'utf8', _ => 1)
  // on parse les événements pour qu'ils soient au format Google Calendar
  let google_events = merged_events.map(parseEvent4GoogleCalendar)
  if (DEBUG) fs.writeFile(path.join(TMP_FOLDER, '30_gts2google_events.json'), JSON.stringify(google_events, null, '\t'), 'utf8', _ => 1)
  // on filtre les erreurs
  google_events = google_events.filter(ev => ev.start && ev.end && ev.start.dateTime && ev.end.dateTime)

  return google_events

  function tobemerged2(ev1, ev2) {
    if (!ev1 || !ev2) return false;
    return ev1.dossier == ev2.dossier && ev1.espace == 'FOU' && ev2.espace == 'SMM' && ev1.heure.fin == ev2.heure.debut
  }

  function merge2(ev1, ev2) {
    let o = Object.assign({}, ev1)
    o.espace = 'FOUSMM'
    o.theme = ''
    o.heure.debut = ev1.heure.debut
    o.heure.fin = ev2.heure.fin
    o.comment = (ev1.comment || '') + '\n' + (ev2.comment || '')
    return o
  }

  function tobemerged3(ev1, ev2, ev3) {
    if (!ev1 || !ev2 || !ev3) return false;
    return  ev1.dossier == ev2.dossier && ev2.dossier == ev3.dossier
            && ev1.espace == 'FOU' && ev2.espace == 'SMM' && (ev3.espace == 'CHA' || ev3.espace == 'JAR')
            && ev1.heure.fin == ev2.heure.debut && ev2.heure.fin == ev3.heure.debut
            && ev3.theme != 102 // ne pas inclure les messes (theme == 102)
  }

  function merge3(ev1, ev2, ev3) {
    let o = Object.assign({}, ev1)
    o.espace = 'FOUSMMCHA'
    o.theme = ''
    o.heure = {
      'debut': ev1.heure.debut,
      'fin': ev3.heure.fin
    }
    o.comment = (ev1.comment || '') + '\n' + (ev2.comment || '') + '\n' + (ev3.comment || '')
    return o
  }
}

function parseEvent4GoogleCalendar(ev) {
  return {
    summary: `${parseMap(ev, EVENT_LABELS)} ${ev.pax}pax ${ev.lang} - ${ev.groupe}`,
    description: `${ev.dossier}\n${ev.agence}\n${(ev.comment || '')}`,
    colorId: parseMap(ev, EVENT_COLORS),
    start: {
      dateTime: moment(ev.date + " " + ev.heure.debut, 'YYYYMMDD HHmm').toISOString()
    },
    end: {
      dateTime: moment(ev.date + " " + ev.heure.fin, 'YYYYMMDD HHmm').toISOString()
    }
  }
}

function parseMap(ev, model) {
  for (label in model) {
    if (typeof model[label] == 'object') {
      if (model[label].test(ev.espace + ev.theme)) return label
    } else if (typeof model[label] == 'function'){
      if (model[label](ev)) return label
    }
  }
  return (model['__DEFAULT__'] || ev.espace + ev.theme)
}

async function getGTSFutureEvents() {
  // renvoie toutes les réservations dans le futur
  let query = dbapi.prepareQuery(QUERY_FUTURE_RESA, {
    today: moment().format('YYYYMMDD')
  })
  let future_events = await dbapi.queryModel(query, MODEL_FUTURE_RESA)
  dbapi.close()
  return future_events
}

function collapse(list, f_filter, f_merge) {
  // parcours les éléments de list et les renvoie tels quels sauf si f_filter renvoie true
  // si f_filter renvoie true, alors on ajoute le résultat de f_merge au lieu de l'élément original
  let res = []
  let nb_args = f_merge.length

  let i = 0
  while (i < list.length) {
    let myargs = []
    for (let j = 0; j < nb_args; j++) {
      myargs.push(list[i + j])
    }
    if (f_filter(...myargs)) {
      res = res.concat(f_merge(...myargs))
      i += nb_args
    } else {
      res.push(list[i])
      i++
    }
  }
  return res
}

module.exports = {
  collapse: collapse,
  getFutureEvents: getFutureEvents
}
