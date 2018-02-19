var express = require('express');
var router = express.Router();
var dbfact = require('../services/db_invoices.js');
var invoices = require('../services/emit_invoice.js');
var path = require('path');

router.get('/', (req, res, next) => {
  const data = {
    otherData: 'Something Else'
  };
  const vueOptions = {
    head: {
      title: 'CIMDN Factures'
      // meta: [{
      //     property: 'og:title',
      //     content: 'CIMDN Factures'
      //   },
      //   {
      //     name: 'twitter:title',
      //     content: 'Page Title'
      //   }
      // ]
    }
  }
  res.renderVue('invoices', data, vueOptions);
});

router.get('/:type', (req, res, next) => {
  var type = req.params.type;
  // retrieve invoices tbd
  if (type == 'tbd') {
    dbfact.getInvoicesTBD().then(invoices => {
      res.send(invoices)
    }).catch(e => {
      res.send({
        error: true,
        code: 'GET_INVOICE_ERROR',
        description: 'Could not retrieve the invoices to be emitted, from the database :('
      })
    })
    // retrieve invoices done
  } else if (type == 'done') {
    dbfact.getInvoicesDone().then(invoices => {
      res.send(invoices)
    }).catch(e => {
      res.send({
        error: true,
        code: 'GET_INVOICE_ERROR',
        description: 'Could not retrieve the invoices emitted, from the database :('
      })
    })
  } else {
    res.send({
      error: true,
      code: 'WRONG_INVOICE_TYPE',
      description: 'The type' + type + ' for invoices is unknown :('
    })
  }
})

// ========================================================================
//                          API
// ========================================================================

// génère la facture pour le dossier :dossier et renvoie le chemin vers le PDF
router.get('/gen/:dossier', (req, res, next) => {

  var dossier_num = req.params.dossier;
  var voucher_num = req.query['voucher_num'];
  var acompte = parseFloat(req.query['acompte']);
  var responsable = req.query['responsable'];
  var pax = req.query['pax'];
  var annee = req.query['annee'];
  var date_emission = req.query['date_emission'];

  var opt = {
    voucher_num: voucher_num,
    acompte: acompte,
    responsable: responsable,
    pdf_dir_save: path.join(__dirname, '../public/downloads'),
    annee: annee,
  }
  if (pax) opt.pax = pax;
  if (date_emission) opt.date_emission = date_emission;

  invoices.genInvoice(dossier_num, opt)
    .then(pdf_paths => res.send(pdf_paths)) // an object with attributes 'fact' and 'refact' (if refac is needed)
    .catch(e => res.send({
      error : true,
      details: e
    }))
})

module.exports = router;
