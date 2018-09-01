const moment = require('moment')
const dbapi = require('../db.js')
const dbInvoices = require('../db_invoices.js')

const curr_year = moment().format("YYYY");
const last_year = (parseInt(curr_year) - 1).toString();
const next_year = (parseInt(curr_year) + 1).toString();

let QUERY_RESA = `SELECT
              Rs_coderesa, Rs_operatcreation, Rs_libellereservation, Rs_datedebut, Rs_heurearrivee, Rs_effectif, Rs_codelangue, Rs_commentaire, Rs_codeetat, Rs_nomliv, Rs_client,
              Ed_libelle,
              Op_nom, Op_prenom,
              Co_code,
                Co_nom, Co_prenom,
                Co_raisonsocialefact, fk_paysfact, Co_villefact, Co_codepostalfact, Co_adresse1fact, Co_adresse2fact, Co_adresse3fact
                Co_raisonsociale, fk_pays, Co_ville, Co_codepostal, Co_adresse1, Co_adresse2, Co_adresse3
            FROM
              Reservation, EtatDossier, Contact, Operateur
            WHERE
              Op_code = Rs_operatcreation
              AND Co_code = Rs_client
              AND Ed_code = Rs_codeetat AND Rs_codeetat = '@etat'
              AND (Rs_datedebut LIKE '%${curr_year}%' OR Rs_datedebut LIKE '%${next_year}%' OR Rs_datedebut LIKE '%${last_year}%')
            ORDER BY Rs_coderesa DESC`;

async function getFutureResas() {
  let query = dbapi.prepareQuery(QUERY_RESA, {
    etat: '2'
  });
  let model2 = Object.assign({}, dbInvoices.model);
  model2['_filter'] = filterConfirmedResas;
  return await dbapi.queryModel(query, model2);
}

function filterConfirmedResas(el) {
  let m = moment(el['Rs_datedebut'], 'YYYYMMDD');
  return m.isSameOrAfter(moment())
}

// nettoie le numéro de dossier fourni en entrée
// e.g. '2548' => 'TC02548*01'
function cleanDossierNum(num_dossier) {
  if (typeof num_dossier != 'string') num_dossier = num_dossier.toString()
  if (num_dossier.length == 4) return "TC0" + num_dossier + "*01";
  return num_dossier
}

async function dossierExists(num_dossier) {
  num_dossier = cleanDossierNum(num_dossier)
  let res = await dbapi.query(`SELECT Rs_coderesa FROM Reservation WHERE Rs_coderesa = '${num_dossier}'`)
  dbapi.close()
  return (res && res.length > 0)
}

// renvoie le numéro d'état du dossier
// renvoie -1 si problème sql, -2 si état non numérique
async function getState(num_dossier) {
  num_dossier = cleanDossierNum(num_dossier)
  let res = await dbapi.query(`SELECT Rs_codeetat FROM Reservation WHERE Rs_coderesa = '${num_dossier}'`)
  dbapi.close()
  if (res && res.length && res[0] && res[0]['Rs_codeetat']) {
    let n = parseInt(res[0]['Rs_codeetat']);
    if (isNaN(n)) return -2
    return n;
  }
  return -1
}

module.exports = {
  cleanDossierNum,
  dossierExists,
  getState,
  getFutureResas
}
