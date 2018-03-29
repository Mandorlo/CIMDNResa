const dbapi = require('../db.js')
const moment = require('moment')
let CACHE = {}

const FLEX = {
  y: ['SUM(Rs_effectif)', 'SUM(Rp_montant)', 'COUNT(Rs_coderesa)'],
  x: ['SUBSTRING(Rs_datedebut,1,4)', 'Rs_nomliv', 'SUBSTRING(Rs_datedebut,5,2)'],
  f: ['SUBSTRING(Rs_datedebut,1,4)', 'Rs_nomliv', 'SUBSTRING(Rs_datedebut,5,2)'],
  corresp: {
    'pax': 'SUM(Rs_effectif)',
    'ca': 'SUM(Rp_montant)',
    'resa': 'COUNT(Rs_coderesa)',
    'year': 'SUBSTRING(Rs_datedebut,1,4)',
    'agency': 'Rs_nomliv',
    'mois': 'SUBSTRING(Rs_datedebut,5,2)'
  }
}

const QUERIES = {
  flex:             `SELECT
                      @y AS y, @x AS x
                    FROM Reservation
                    LEFT JOIN ReservationPrestation ON Rs_coderesa = Rp_coderesa
                    WHERE
                      (Rs_codeetat = 3 OR Rs_codeetat = 7)
                    GROUP BY @x`,
  flexFilter:       `SELECT
                      @y as y, @x as x, @f as f
                    FROM Reservation
                    LEFT JOIN ReservationPrestation ON Rs_coderesa = Rp_coderesa
                    WHERE
                      (Rs_codeetat = 3 OR Rs_codeetat = 7)
                    GROUP BY @x, @f`,
  flexDates:        `SELECT
                      @y as y, SUBSTRING(Rs_datedebut,1,4) as x
                    FROM Reservation
                    LEFT JOIN ReservationPrestation ON Rs_coderesa = Rp_coderesa
                    WHERE
                     ((Rs_codeetat = 3 OR Rs_codeetat = 7))
                     AND Rs_datedebut > SUBSTRING(Rs_datedebut,1,4)+'@start'
                     AND Rs_datedebut < SUBSTRING(Rs_datedebut,1,4)+'@end'
                    GROUP BY SUBSTRING(Rs_datedebut,1,4)`
}

const MODELS = {
  flex: {
    'x': 'x',
    'y': 'y'
  },
  flexFilter: {
    'x': 'x',
    'y': 'y',
    'f': 'f'
  }
}

// utilisé pour les graphiques de la vue flexBarChart.vue
async function getFlex(xlabel, ylabel, filter) {
  if (!FLEX.corresp[xlabel] || !FLEX.corresp[ylabel]) throw "Problème in getFlex statistics"
  let id = 'getFlex-'+xlabel+ylabel+filter;
  if (CACHE[id] && moment.duration(moment().diff(CACHE[id].time)).asDays() < 1) return Promise.resolve(CACHE[id].data);

  let x = FLEX.corresp[xlabel]
  let y = FLEX.corresp[ylabel]
  let f = FLEX.corresp[filter]
  let query = dbapi.prepareQuery(QUERIES.flex, {x, y})
  let modele = MODELS.flex
  if (f && f != 'ALL') {
    query = dbapi.prepareQuery(QUERIES.flexFilter, {x, y, f})
    modele = MODELS.flexFilter
  }
  let res = await dbapi.queryModel(query, modele)
  CACHE[id] = {
    time: moment(),
    data: res
  }
  setTimeout(_ => dbapi.close(), 2000)
  return res
}

async function getFlexDates(ylabel, start, end) {
  // start and end can be either a string 'MMDD' or a moment object
  // if end is undefined, we do end = moment()
  if (!FLEX.corresp[ylabel]) throw "Problème in getFlexDates statistics"

  let y = FLEX.corresp[ylabel]
  if (typeof start != 'string' && typeof start.format == 'function') start = start.format('MMDD');
  if (!end) end = moment().format('MMDD');
  else if (typeof end != 'string' && typeof end.format == 'function') end = end.format('MMDD');

  let id = 'getFlexDates-'+ylabel+start+end;
  if (CACHE[id] && moment.duration(moment().diff(CACHE[id].time)).asDays() < 1) return Promise.resolve(CACHE[id].data);

  let query = dbapi.prepareQuery(QUERIES.flexDates, {y, start, end})
  let res = await dbapi.queryModel(query, MODELS.flex)
  CACHE[id] = {
    time: moment(),
    data: res
  }
  setTimeout(_ => dbapi.close(), 2000)
  return res
}

async function getStat(stat_name) {
  if (!QUERIES[stat_name] || !MODELS[stat_name]) throw `Impossible de trouver le type de stats "${stat_name}"`
  let res = await dbapi.queryModel(QUERIES[stat_name], MODELS[stat_name])
  dbapi.close()
  return res
}

module.exports = {
  get: getStat,
  getFlex: getFlex,
  getFlexDates: getFlexDates
}
