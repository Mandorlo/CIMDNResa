const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const ph = require('./execute-phantom.js');

let ph_script = path.join(__dirname, "pdf-phantom-renderer.js");

async function ejs2pdf(template_path, output_path, data, opt = {}) {
  /* opt is an object with this possible option :
      - keep_tmp_files: false
   for phantom exec opt can also have these options :
     - cwd : path/to/working/dir/for/phantomjs.exe
     - debug : true | false
     - timeout_ms : nb millisec before promise rejects (0 = never)
  */
  if (opt['keep_tmp_files'] === true) console.log("ejs2pdf info : temp files are kept on disk");
  output_path = path.resolve(output_path);
  let tmp_path = path.join(__dirname, 'ejs2pdf_template_' + randomString(10) + '.html'); // temp HTML file (will be deleted at the end)

  try {
    let html_str = await ejs2html(template_path, data, {});
    let write_res = fs.writeFileSync(tmp_path, html_str, 'utf8');
    let opt_ph = {
      cwd: (opt.cwd || __dirname),
      debug: (opt.debug || false),
      timeout_ms: (opt.timeout_ms || 10000)
    }
    let code = await ph.renderPhantom(ph_script, tmp_path, output_path, opt_ph);
    if (!opt['keep_tmp_files']) fs.unlinkSync(tmp_path);
    if (fs.existsSync(output_path)) return output_path;
    else throw {
      errnum: 'PHANTOM_FAILURE',
      fun: 'pdf_renderer > ejs2pdf',
      details: 'Phantomjs script html => pdf failed'
    }
  } catch (e) {
    if (!opt['keep_tmp_files'] && fs.existsSync(tmp_path)) fs.unlinkSync(tmp_path);
    throw e
  }
}

function ejs2html(template_path, data, options) {
  return new Promise((resolve, reject) => {
    ejs.renderFile(template_path, data, options, (err_renderejs, str) => {
      if (err_renderejs) reject(err_renderejs);
      else resolve(str)
    })
  })
}

function randomString(n) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < n; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

module.exports = {
  ejs2pdf: ejs2pdf,
  ejs2html: ejs2html
}
// export default ejs2pdf;

// =======================================================================
//                              TEST
// =======================================================================

// var moment = require('moment');
// ejs2pdf("./templates/pdf-template-refac.ejs",
//   "./test.pdf", {
//     fact_num: "F 7093",
//     refact_num: "F 18001",
//     group_name: "GROUP1",
//     dossier_num: "TC02761*01",
//     date_format1: moment().format("DD-MMM-YYYY"),
//     date_FR: moment().format("D MMMM YYYY"),
//     date_EN: moment().format("D MMMM YYYY") + " (EN)",
//     global_pax: 34,
//     activities: [{
//       name: "Lunch",
//       pax: 33,
//       date: moment().format("DD-MM-YY"),
//       time: moment().format("HH:mm")
//     }],
//     invoices: [{
//       name: "Lunch Menu 3",
//       price_per_pax: "55.00",
//       pax: 20,
//       price_total: 2
//     }],
//     prix_avant_acompte: "2 000.00",
//     acompte: "100.00",
//     prix_final: "1 900.00"
//   }, {
//     keep_tmp_files: false
//   })
//   .then(r => console.log("ok", r))
//   .catch(e => console.log("ERROR", e))

// var moment = require('moment');
// ejs2pdf("./templates/pdf-template-invoice.ejs",
//         "./test.pdf",
//         {
//           fact_num: "F 18001",
//           agency_address: "agency<br>address",
//           voucher_num: "12345",
//           group_name: "GROUP1",
//           dossier_num: "TC02761*01",
//           date_format1: moment().format("DD-MMM-YYYY"),
//           responsable: "Carlo Baugé",
//           date_FR: moment().format("D MMMM YYYY"),
//           date_EN: moment().format("D MMMM YYYY") + " (EN)",
//           global_pax: 34,
//           activities: [{
//             name: "Visite",
//             pax: 33,
//             date: moment().format("DD-MM-YY"),
//             time: moment().format("HH:mm")
//           }, {
//             name: "Lunch Menu 3",
//             pax: 35,
//             date: moment().format("DD-MM-YY"),
//             time: moment().format("HH:mm")
//           }],
//           invoices: [{
//             name: "Route 3",
//             price_per_pax: "35.00",
//             pax: 30,
//             price_total: 1
//           }, {
//             name: "Lunch Menu 3",
//             price_per_pax: "55.00",
//             pax: 20,
//             price_total: 2
//           }],
//           prix_avant_acompte: "2 000.00",
//           acompte: "100.00",
//           prix_final: "1 900.00"
//         }, {
//           keep_tmp_files: false
//         })
//   .then(r => console.log("ok", r))
//   .catch(e => console.log("ERROR", e))

// TO DEBUG PhantomJS Script run :
// ..\..\phantomjs\bin\phantomjs.exe .\pdf-phantom-renderer.js .\ejs2pdf_template_DR2WEPvVSg.html ./out.pdf
