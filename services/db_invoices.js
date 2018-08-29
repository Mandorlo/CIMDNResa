const dbapi = require('./db.js')
const moment = require('moment')
const PARAM = require('./param/param.js')

const DEBUG = true

const curr_year = moment().format("YYYY");
const last_year = (parseInt(curr_year) - 1).toString();
const next_year = (parseInt(curr_year) + 1).toString();

let QUERY_INVOICE = `SELECT
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
              EXISTS (SELECT Rp_coderesa FROM ReservationPrestation WHERE Rp_coderesa = Rs_coderesa)
              AND Op_code = Rs_operatcreation
              AND Co_code = Rs_client
              AND Ed_code = Rs_codeetat AND Rs_codeetat = '@etat'
              AND (Rs_datedebut LIKE '%${curr_year}%' OR Rs_datedebut LIKE '%${next_year}%' OR Rs_datedebut LIKE '%${last_year}%')
            ORDER BY Rs_coderesa DESC`;

let QUERY_SINGLE = `SELECT TOP 1
              Rs_coderesa, Rs_operatcreation, Rs_libellereservation, Rs_datedebut, Rs_heurearrivee, Rs_effectif, Rs_codelangue, Rs_commentaire, Rs_codeetat, Rs_nomliv, Rs_client,
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

let model = {
  "id": "Rs_coderesa",
  "label": "Rs_libellereservation",
  "date": "Rs_datedebut", // type = string YYYYMMDD
  "time": "Rs_heurearrivee",
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
  'factnum': {
    "_query": `SELECT TOP 1 Rp_commentaireinterne, Rp_commentaireexterne
              FROM ReservationPrestation
              WHERE Rp_coderesa = '@Rs_coderesa'
                    AND (Rp_commentaireinterne IS NOT NULL OR Rp_commentaireexterne IS NOT NULL)`,
    "_": getFactNum
  },
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

// tells if o is an object that corresponds to the invoice object model
function isInvoiceObject(o, m = null) {
  if (m === null) m = Object.assign({}, model)
  for (let attr of Object.getOwnPropertyNames(m)) {
    if (!o.hasOwnProperty(attr)) return false
    else if (typeof m[attr] == 'object') {
      let b = isInvoiceObject(o[attr], m[attr])
      if (!b) return false
    }
  }
  return true
}

function filterInvoicesTBD(el) {
  let m = moment(el['Rs_datedebut'], 'YYYYMMDD');
  return m.isBefore(moment())
}

function getStreet(el) {
  let s = (el['Co_adresse1fact'] || '') + " " + (el['Co_adresse2fact'] || '');
  if (!s.trim()) s = (el['Co_adresse1'] || '') + " " + (el['Co_adresse2'] || '');
  return s.trim()
}

function getCountry(el) {
  return (COUNTRIES[el['fk_paysfact']] || COUNTRIES[el['fk_pays']] || '')
}

function getFactNum(el) {
  let s = (el['Rp_commentaireinterne'] || '') + " " + (el['Rp_commentaireexterne'] || '');
  let res = /facture\s*:?\s*([^\r\n\<]+)?([\r\n\<]|$)/gi.exec(s);
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
    let query = dbapi.prepareQuery(QUERY_INVOICE, {
      etat: '2'
    });
    let model2 = Object.assign({}, model);
    model2['_filter'] = filterInvoicesTBD;
    dbapi.queryModel(query, model2).then(r => {
      // dbapi.close()
      // on filtre uniquement ceux qui n'ont pas de num de facture
      let r_nofactnum = r.filter(d => !d.factnum)
      // on ajoute des infos supplémentaires
      r_nofactnum_plus = r_nofactnum.map(i => addInfo(i))
      resolve(r_nofactnum)
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
      // dbapi.close();
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
      // dbapi.close();
      if (r && r.length) resolve(r[0]);
      else reject("No results to getDossier (for Invoices) N° " + dossier_num)
    }).catch(e => {
      if (DEBUG) console.log("Error in getDossier (for Invoices): ", e);
      reject(e)
    });
  })
}

// i is an invoice object (as retrieved in getInvoicesTBD)
// it adds additional info about for example the agency, from the PARAM
function addInfo(i) {
  let agency_param = PARAM.agencies.filter(a => a.irec_name == i.agency.name)
  if (agency_param && agency_param.length) {
    i.agency = Object.assign(i.agency, agency_param[0])
  }
  return i
}

module.exports = {
  QUERY_INVOICE,
  getInvoicesTBD: getInvoicesTBD,
  getInvoicesDone: getInvoicesDone,
  getDossier: getDossier,
  isInvoiceObject: isInvoiceObject,
  model
}


// =======================================================================
//                                  TESTS
// =======================================================================

// getDossier("TC02231*01").then(r => console.log(JSON.stringify(r, null, "  "))).catch(e => console.log(e))
