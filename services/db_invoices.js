const dbapi = require('./db.js');
const moment = require('moment');

const DEBUG = true;

const curr_year = moment().format("YYYY");
const last_year = (parseInt(curr_year) - 1).toString();

var QUERY_INVOICE = `SELECT
              Rs_coderesa, Rs_operatcreation, Rs_libellereservation, Rs_datedebut, Rs_effectif, Rs_codelangue, Rs_commentaire, Rs_codeetat, Rs_nomliv, Rs_client,
              Rp_commentaireinterne, Rp_commentaireexterne,
              Ed_libelle,
              Op_nom, Op_prenom,
              Co_code,
                Co_nom, Co_prenom,
                Co_raisonsocialefact, fk_paysfact, Co_villefact, Co_codepostalfact, Co_adresse1fact, Co_adresse2fact, Co_adresse3fact
                Co_raisonsociale, fk_pays, Co_ville, Co_codepostal, Co_adresse1, Co_adresse2, Co_adresse3
            FROM
              Reservation, ReservationPrestation, EtatDossier, Contact, Operateur
            WHERE
              Rs_coderesa = Rp_coderesa
              AND Op_code = Rs_operatcreation
              AND Co_code = Rs_client
              AND Ed_code = Rs_codeetat AND Rs_codeetat = '@etat'
              AND (Rs_datedebut LIKE '%${curr_year}%' OR Rs_datedebut LIKE '%${last_year}%')
            ORDER BY Rs_coderesa DESC`;

var QUERY_SINGLE = `SELECT TOP 1
              Rs_coderesa, Rs_operatcreation, Rs_libellereservation, Rs_datedebut, Rs_effectif, Rs_codelangue, Rs_commentaire, Rs_codeetat, Rs_nomliv, Rs_client,
              Rp_commentaireinterne, Rp_commentaireexterne,
              Ed_libelle,
              Op_nom, Op_prenom,
              Co_code,
                Co_nom, Co_prenom,
                Co_raisonsocialefact, fk_paysfact, Co_villefact, Co_codepostalfact, Co_adresse1fact, Co_adresse2fact, Co_adresse3fact
                Co_raisonsociale, fk_pays, Co_ville, Co_codepostal, Co_adresse1, Co_adresse2, Co_adresse3
            FROM
              Reservation, ReservationPrestation, EtatDossier, Contact, Operateur
            WHERE
              Rs_coderesa = Rp_coderesa
              AND Op_code = Rs_operatcreation
              AND Rp_coderesa = '@dossier_num'
              AND Co_code = Rs_client
              AND Ed_code = Rs_codeetat
            ORDER BY Rs_coderesa DESC`;

var COUNTRIES = {
  'FR': 'FRANCE',
  'IL': 'ISRAEL'
}

var model = {
  "id": "Rs_coderesa",
  "label": "Rs_libellereservation",
  "date": "Rs_datedebut", // type = string YYYYMMDD
  "pax": "Rs_effectif", // type = int
  "responsable": {
    "code": "Rs_operatcreation",
    "nom": "Op_nom",
    "prenom": "Op_prenom"
  },
  "codelang": "Rs_codelangue",
  "status": {
    "label": "Ed_libelle",
    "code": "Rs_codeetat"
  },
  "comments": {
    "comm1": "Rs_commentaire",
    "comm2": "Rp_commentaireinterne",
    "comm3": "Rp_commentaireexterne"
  },
  "agency": {
    "id": "Co_code",
    "name": el => (el['Co_raisonsocialefact'] || el['Co_raisonsociale'] || (el['Co_prenom'] || '') + ' ' + (el['Co_nom'] || '') || '').trim(),
    "street": getStreet,
    "postalcode": el => (el['Co_codepostalfact'] || el['Co_code_postal'] || '').trim(),
    "city": el => (el['Co_villefact'] || el['Co_ville'] || '').trim(),
    "country": getCountry
  },
  "factnum": getFactNum,
  "invoice": {
    "_query": `SELECT Rp_effectif, Rp_codeprest, Rp_libprest, Rp_prixmonnaie1, Rp_mttremise, Rp_montant
              FROM ReservationPrestation
              WHERE Rp_coderesa = '@Rs_coderesa'`,
    "pax": "Rp_effectif",
    "code": "Rp_codeprest",
    "label": "Rp_libprest",
    "price_per_pax": "Rp_prixmonnaie1", // type = int
    "discount": "Rp_mttremise", // type = int
    "price": "Rp_montant" // type = int
  },
  "activities": {
    "_query": `SELECT Res_codeespace, Res_date, Res_heure, Res_nbpers, Res_codetheme
              FROM ReservationEspace
              WHERE Res_numresa = '@Rs_coderesa'`,
    "pax": "Res_nbpers",
    "time": "Res_heure",
    "date": "Res_date",
    "espace": "Res_codeespace",
    "theme": "Res_codetheme"
  }
}

function filterInvoicesTBD(el) {
  var m = moment(el['Rs_datedebut'], 'YYYYMMDD');
  return m.isBefore(moment())
}

function getStreet(el) {
  var s = (el['Co_adresse1fact'] || '') + " " + (el['Co_adresse2fact'] || '');
  if (!s.trim()) s = (el['Co_adresse1'] || '') + " " + (el['Co_adresse2'] || '');
  return s.trim()
}

function getCountry(el) {
  return (COUNTRIES[el['fk_paysfact']] || COUNTRIES[el['fk_pays']] || '')
}

function getFactNum(el) {
  var s = (el['Rp_commentaireinterne'] || '') + " " + (el['Rp_commentaireexterne'] || '');
  var res = /facture\s*:?\s*([^\r\n\<]+)?([\r\n\<]|$)/gi.exec(s);
  try {
    if (res && res.length > 1) return res[1].trim();
  } catch(e) {
    console.log("/!\\ Error (non bloquant mais à investiguer) in getFactNum from commentaire in GTS : ", e);
    return "";
  }
  return "";
}

// renvoie une promesse avec les dossiers à facturer
function getInvoicesTBD() {
  return new Promise((resolve, reject) => {
    var query = dbapi.prepareQuery(QUERY_INVOICE, {
      etat: '2'
    });
    var model2 = Object.assign({}, model);
    model2['_filter'] = filterInvoicesTBD;
    dbapi.queryModel(query, model2).then(r => {
      dbapi.close()
      resolve(r)
    }).catch(e => {
      if (DEBUG) console.log("Error in getInvoicesDone: ", e);
      reject(e)
    });
  })
}

// renvoie une promesse avec les dossiers déjà facturés
function getInvoicesDone() {
  return new Promise((resolve, reject) => {
    var query = dbapi.prepareQuery(QUERY_INVOICE, {
      etat: '3'
    });
    dbapi.queryModel(query, model).then(r => {
      dbapi.close();
      resolve(r)
    }).catch(e => {
      if (DEBUG) console.log("Error in getInvoicesDone: ", e);
      reject(e)
    });
  })
}

// renvoie le dossier demandé prêt pour les invoices
function getDossier(dossier_num) {
  var myquery = QUERY_INVOICE.replace('Rp_coderesa', "Rp_coderesa AND Rp_coderesa = '" + dossier_num + "' ");
  return new Promise((resolve, reject) => {
    var query = dbapi.prepareQuery(QUERY_SINGLE, {
      dossier_num: dossier_num
    });
    dbapi.queryModel(query, model).then(r => {
      dbapi.close();
      if (r && r.length) resolve(r[0]);
      else reject("No results to getDossier (for Invoices) N° " + dossier_num)
    }).catch(e => {
      if (DEBUG) console.log("Error in getDossier (for Invoices): ", e);
      reject(e)
    });
  })
}

module.exports = {
  getInvoicesTBD: getInvoicesTBD,
  getInvoicesDone: getInvoicesDone,
  getDossier: getDossier
}


// =======================================================================
//                                  TESTS
// =======================================================================

// getDossier("TC02231*01").then(r => console.log(JSON.stringify(r, null, "  "))).catch(e => console.log(e))
