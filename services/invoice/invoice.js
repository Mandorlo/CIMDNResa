const fs = require('fs')
const path = require('path')
const files = require('../files/files.js')
const moment = require('moment')
const PARAM = require('../param/param.js')
const dbfact = require('../db_invoices.js')
const resa = require('../resa/resa.js')

// indique si le numero @num_fact existe dans le dossier factures
// fact_dir can be :
// * an array of final dirs (final means with year of facturation included)
// * a string of final dirs
// * a number representing the year we want
async function factureExists(num_fact, fact_dir = null) {
  if (typeof num_fact != 'string') num_fact = numfact.toString()
  // on enlève le F devant si jamais il existe
  num_fact = cleanFactnum(num_fact)

  if (fact_dir === null) {
    try {
      fact_dir = [getFactDir(), getRefacDir()];
    } catch (e) {
      return {
        'val': false,
        'dir': '',
        err: e
      }
    }
  }
  if (typeof fact_dir == 'string') {
    if (!isNaN(parseInt(fact_dir))) fact_dir = parseInt(fact_dir);
    else fact_dir = [fact_dir];
  }
  if (typeof fact_dir == 'number' && fact_dir > 2010 && fact_dir < 3000) {
    try {
      fact_dir = [getFactDir(fact_dir), getRefacDir(fact_dir)];
    } catch (e) {
      return {
        'val': false,
        'dir': '',
        err: e
      }
    }
  }

  if (typeof fact_dir != 'object' || !fact_dir.length) return {
    'val': false,
    'dir': '',
    err: {
      'errnum': 'INVALID_PARAM',
      'fun': 'services > invoice. > factureExists',
      'details': `fact_dir = ${JSON.stringify(fact_dir)} (of type ${typeof fact_dir})`
    }
  }

  for (mydir of fact_dir) {
    if (files.isDir(mydir)) {
      let exists = await factureExistsDir(num_fact, mydir)
      if (exists) return {
        'val': true,
        'dir': mydir
      }
    }
  }
  return {
    val: false,
    dir: ''
  }
}

// core function fore factureExistsDir
function factureExistsDir(fact_num, dir) {
  // @fact_num must be a string = the facture number without the 'F'
  // dir must be a valid final directory
  let re_numfact = new RegExp(`^F\\s+${fact_num}.+`, 'g')

  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err)
        return
      }
      for (file of files) {
        if (re_numfact.test(file)) {
          resolve(true)
          return
        }
      }
      resolve(false)
    })
  })
}

async function dosssierIsRefacturable(dossier_num) {
  let dossier = {}
  if (typeof dossier_num == 'object') {
    let b = await dbfact.isInvoiceObject(dossier_num)
    if (!b) throw {
      errnum: 'INVALID_PARAM',
      fun: 'service > invoice > dosssierIsRefacturable',
      details: `param @dossier_num is not a valid invoice object : ${JSON.stringify(dossier_num)}`
    }
    dossier = dossier_num
  } else {
    dossier_num = resa.cleanDossierNum(dossier_num)
    dossier = await dbfact.getDossier(dossier_num)
  }

  let refac = dossier['invoice'].filter(presta => PARAM.invoice.prestas_refacturables.indexOf(presta['code']) >= 0);
  return (refac && refac.length > 0)
}

// devine l'année où la facture @fact_num a été émise
function factnum2year(fact_num) {
  let num_fact = cleanFactnum(fact_num)
  if (num_fact.length == 5) {
    let years2 = parseInt(num_fact.substr(0, 2))
    if (!isNaN(years2)) return (2000 + years2)
  } else if (num_fact.length == 4) {
    let years1 = parseInt(num_fact.substr(0, 1))
    let diz_year = Math.floor(moment().year() / 10) % 10;
    let guess = 2000 + diz_year * 10 + years1;
    if (guess > moment().year()) guess = 2000 + (diz_year - 1) * 10 + years1;
    if (!isNaN(years1)) return guess
  }
  return 0
}

function getFactDir(annee = null) {
  if (!annee) annee = moment().format("YYYY");
  if (typeof annee != 'string') annee = annee.toString();
  let res_dir = path.join(PARAM.network.default_frat_dir, annee)
  if (files.isDir(res_dir)) return res_dir;
  else throw {
    'errnum': 'INVALID_PARAM',
    'fun': 'services > invoice > getFactDir',
    'details': `getFactDir(${annee}) => '${res_dir}' : this is not a valid directory`
  }
}

function getRefacDir(annee = null) {
  if (!annee) annee = moment().format("YYYY");
  if (typeof annee != 'string') annee = annee.toString();
  let res_dir = path.join(PARAM.network.default_cimdn_dir, annee)
  if (files.isDir(res_dir)) return res_dir;
  else throw {
    'errnum': 'INVALID_PARAM',
    'fun': 'services > invoice > getRefacDir',
    'details': `getRefacDir(${annee}) => '${res_dir}' : this is not a valid directory`
  }
}

function cleanFactnum(num_fact) {
  let res = /(F\s+)?([0-9]{4,5})/g.exec(num_fact)
  if (res && res.length > 2) return res[2];
  if (typeof num_fact == 'number') return num_fact.toString()
  else return num_fact
}

module.exports = {
  dosssierIsRefacturable: dosssierIsRefacturable,
  factureExists: factureExists,
  factnum2year: factnum2year,
  factdir: getFactDir,
  refacdir: getRefacDir
}
