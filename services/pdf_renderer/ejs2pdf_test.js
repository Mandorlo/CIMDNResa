const fs = require('fs')
const path = require('path')
const moment = require('moment')
const ejs2pdf = require('./ejs2pdf.js')
const execPh = require('./execute-phantom.js')

let ph_script = path.join(__dirname, "pdf-phantom-renderer.js");

const TMP_PATH = {
  template: path.join(__dirname, './templates/pdf-template-invoice.ejs'),
  html: path.join(__dirname, './doc.html'),
  pdf: path.join(__dirname, './doc.pdf')
}

// test EJS transform to HTML
async function ejs2htmlTEST() {
  let data = {
    fact_num: 'NUM_FACTURE',
    refact_num: 'NUM_REFAC', // utilisé uniquement pour la refac éventuelle
    agency_address: 'ADRESSE',
    voucher_num: 'voucher_num',
    group_name: 'group_name',
    dossier_num: 'id',
    date_format1: moment().format('DD-MM-YY'),
    responsable: 'Carlo',
    date_FR: moment().format('DD-MM-YY') + '_FR',
    date_EN: moment().format('DD-MM-YY') + '_EN',
    global_pax: 'global_pax',
    activities: [{
      name: 'activity1',
      pax: 'pax1',
      date: moment().format('DD-MM-YYYY'),
      time: moment().format("HH:mm")
    }, {
      name: 'activity2',
      pax: 'pax2',
      date: moment().format('DD-MM-YYYY'),
      time: moment().add(2, 'h').format("HH:mm")
    }],
    invoices: [{
      name: 'invoice1',
      price_per_pax: 'price_per_pax1',
      pax: 'pax1',
      price_total: 'price_total'
    }],
    prix_avant_acompte: 'price_before_acompte',
    acompte: 'acompte',
    prix_final: 'prix_final',
    bank_account: 'mercantile',
    amount_currency: 'montant_devise',
    other_currency: 'sym_devise'
  }
  let html = await ejs2pdf.ejs2html(TMP_PATH.template, data, {})
  let write_res = fs.writeFileSync(TMP_PATH.html, html, 'utf8');
}

// THEN EXECUTE THIS COMMAND in this "pdf_renderer" directory to test the phantom script
// ..\..\phantomjs\bin\phantomjs.exe "C:\Users\carlo\Documents\Projets\GTSExpress\services\pdf_renderer\pdf-phantom-renderer.js" "C:\Users\carlo\Documents\Projets\GTSExpress\services\pdf_renderer\doc.htmll" doc.pdf

// test this to test the script that wraps the phantomjs script
async function html2pdfTEST() {
  let opt_ph = {
    cwd: __dirname,
    debug: true,
    timeout_ms: 10000
  }
  let res = await execPh.renderPhantom(ph_script, TMP_PATH.html, TMP_PATH.pdf, opt_ph)
}

html2pdfTEST().then(r => console.log(r)).catch(e => console.log('ERROR', e))
