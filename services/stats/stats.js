const dbapi = require('../db.js')

const FLEX = {
  y: ['SUM(Rs_effectif)', 'SUM(Rp_montant)', 'COUNT(Rs_coderesa)'],
  x: ['SUBSTRING(Rs_datedebut,1,4)', 'Rs_nomliv', 'SUBSTRING(Rs_datedebut,5,2)'],
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
  flex:                     `SELECT
                              @y AS y, @x AS x
                            FROM Reservation
                            LEFT JOIN ReservationPrestation ON Rs_coderesa = Rp_coderesa
                            WHERE
                              (Rs_codeetat = 3 OR Rs_codeetat = 7)
                            GROUP BY @x`,
  // freq_per_agency:          `SELECT
  //                             SUM(Rs_effectif) AS Pax, Rs_nomliv
  //                           FROM Reservation
  //                           WHERE
  //                             (Rs_codeetat = 3 OR Rs_codeetat = 7)
  //                           GROUP BY Rs_nomliv
  //                           ORDER BY Rs_nomliv`,
  // freq_per_year:            `SELECT
  //                             SUM(Rs_effectif) AS Pax, SUBSTRING(Rs_datedebut,1,4) AS Year
  //                           FROM Reservation
  //                           WHERE
  //                             (Rs_codeetat = 3 OR Rs_codeetat = 7)
  //                           GROUP BY SUBSTRING(Rs_datedebut,1,4)
  //                           ORDER BY SUBSTRING(Rs_datedebut,1,4)`,
  freq_per_agency_per_year: `SELECT
                              SUM(Rs_effectif) AS Pax, SUBSTRING(Rs_datedebut,1,4) AS Year, Rs_nomliv
                            FROM Reservation
                            WHERE
                              (Rs_codeetat = 3 OR Rs_codeetat = 7)
                            GROUP BY SUBSTRING(Rs_datedebut,1,4), Rs_nomliv
                            ORDER BY Rs_nomliv, SUBSTRING(Rs_datedebut,1,4)`
}

const MODELS = {
  flex: {
    'x': 'x',
    'y': 'y'
  },
  // freq_per_agency : {
  //   'pax': 'Pax',
  //   'agency': 'Rs_nomliv'
  // },
  // freq_per_year : {
  //   'pax': 'Pax',
  //   'year': 'Year'
  // },
  freq_per_agency_per_year: {
    'pax': 'Pax',
    'year': 'Year',
    'agency': 'Rs_nomliv'
  }
}

async function getFlex(xlabel, ylabel) {
  if (!FLEX.corresp[xlabel] || !FLEX.corresp[ylabel]) throw "Problème in getFlex statistics"
  let x = FLEX.corresp[xlabel]
  let y = FLEX.corresp[ylabel]
  let query = dbapi.prepareQuery(QUERIES.flex, {x, y})
  let res = await dbapi.queryModel(query, MODELS.flex)
  dbapi.close()
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
  getFlex: getFlex
}
