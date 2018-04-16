const fs = require('fs')
const dbi = require('../db_invoices.js')

dbi.getInvoicesTBD().then(data => {
  fs.writeFile("./test_invoices.json", JSON.stringify(data, null, '\t'), function(err) {
    if (err) {
      return console.log(err);
    }
    console.log(`The invoices were saved ! (${data.length} invoices)`);
  });
})
