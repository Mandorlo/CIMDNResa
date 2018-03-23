/*
This module will be called to
- create invoices from a dossier number or JS object
- generate a PDF
- store it on the network disk
The main function that does all this is 'genInvoice'
*/
const dbfact = require('./db_invoices.js');
const _ = require('lodash');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const ejs2pdf = require('./pdf_renderer/ejs2pdf.js').ejs2pdf;
// import ejs2pdf from './pdf_renderer/ejs2pdf.js'

const default_frat_dir = "Z:\\Factures émises\\Frat\\";
const default_cimdn_dir = "Z:\\Factures émises\\CIMDN\\";
const fact_template = path.join(__dirname, "./pdf_renderer/templates/pdf-template-invoice.ejs");
const refact_template = path.join(__dirname, "./pdf_renderer/templates/pdf-template-refac.ejs");
const PARAM = {
  prestas_refacturables: ["CAFGPE", "CAF3CPENFG", "CAFPACK3", "CAF3CPADUG", "CAFPACK2", "CAF3CHDGP", "CAFPACK1"],
  refac_prices: {
    "CAFPACK1": 30, // au lieu de 35 NIS
    "CAFPACK2": 40, // au lieu de 43 NIS
    "CAFPACK3": 50 // au lieu de 55 NIS
  },
  re_fact_num: /F\s[0-9]+/g // l'expression régulière des factures
}

function genInvoice(dossiernum_or_obj, opt = {}) {
  let myopt = {
    debug: false,
    voucher_num: null,
    fact_num: null,
    refact_num: null,
    responsable: null,
    annee: null, // annee d'émission de la facture
    acompte: 0, // doit être un int ou decimal !
    bank_account: 'mercantile', // 'mercantile' || 'pax-bank'
    pdf_dir_save: path.join(__dirname, "../public/downloads/"), // le dossier où sotcker le pdf
  }
  Object.assign(myopt, opt)
  if (myopt.date_emission) myopt.date_emission = moment(myopt.date_emission, "YYYYMMDD").format("DD-MMM-YYYY");

  return new Promise((resolve, reject) => {
    let whenDossierReceived = getDossierObj(dossiernum_or_obj);
    let whenFactNumReceived;
    if (!PARAM.re_fact_num.test(myopt.fact_num) || !PARAM.re_fact_num.test(myopt.refact_num)) {
      whenFactNumReceived = nextFactNum([default_frat_dir, default_cimdn_dir], myopt.annee);
    } else {
      console.log("DEBUG2")
      whenFactNumReceived = Promise.resolve([myopt.fact_num, myopt.refact_num])
    }

    Promise.all([whenDossierReceived, whenFactNumReceived])

      .then(res_list => {
        if (myopt.debug === true) console.log("GTS dossier = ", JSON.stringify(dossier, null, '  '));
        return res_list
      })

      .then(res_list => {
        var dossier_raw = res_list[0];
        var fact_num_list = res_list[1];

        dossier_raw['fact_num'] = fact_num_list[0]; // num facture normale (frat)
        dossier_raw['refact_num'] = fact_num_list[1]; // num refact
        try {
          var dossier = addInfoToDossier(dossier_raw, myopt);
        } catch(e) {
          reject(e)
          return
        }

        let fact_promises = []; // contiendra la ou les 2 promise de génération pdf des factures

        // ==================== ON GENERE LA FACTURE PRINCIPALE (FRAT)

        // on parse le dossier pour être utilisable par le template ejs (qui sera transformé en pdf)
        try {
          var dossier_ready = parseDossierObj(dossier);
          if (myopt.debug === true) console.log("Dossier parsed : ", dossier_ready)
        } catch (e) {
          reject(e)
        }

        // on génère le nom du fichier pdf de facture
        let pdf_names = genPDFInvoiceNames(dossier);
        if (myopt.debug === true) console.log("PDF filenames = ", pdf_names);

        // on génère le PDF facture
        let p_frat = ejs2pdf(fact_template, path.join(myopt.pdf_dir_save, pdf_names.fact), dossier_ready);
        fact_promises.push(p_frat);

        // ==================== ON GENERE EVENTUELLEMENT LA REFAC

        // on récupère la liste des prestations refacturables
        var prestas_refac = getRefacPrestaList(dossier);

        if (prestas_refac && prestas_refac.length) {
          if (myopt.debug) console.log("Prestas refacturables trouvées : ", prestas_refac);
          // on récupère aussi la liste des acitvités refacturables
          var activities_refac = getRefacActivityList(dossier);
          // on modifie dossier avec uniquement les activités et prestations refacturables
          dossier['activities'] = activities_refac;
          dossier['invoice'] = modifyPricesRefac(prestas_refac); // ici on modifie aussi éventuellement le prix de certaines prestations

          // on parse en mode refac
          try {
            var dossier_refac_ready = parseDossierObj(dossier);
            if (myopt.debug) console.log("Dossier parsed for refac : ", dossier_refac_ready)
          } catch (err_parse_refac) {
            reject(err_parse_refac)
          }

          // on génère le PDF de refacturation
          let p_cimdn = ejs2pdf(refact_template, path.join(myopt.pdf_dir_save, pdf_names.refact), dossier_refac_ready);
          fact_promises.push(p_cimdn);
        } else if (myopt.debug) {
          console.log("Pas de refacturation")
        }
        return Promise.all(fact_promises);
      })

      .then(fact_paths => {
        if (fact_paths.length == 1) resolve({
          fact: fact_paths[0]
        });
        else resolve({
          fact: fact_paths[0],
          refact: fact_paths[1]
        })
      })

      .catch(err => {
        if (myopt.debug) console.log("Error : ", err);
        reject(err)
      })
  })
}

// ====================================================================
//                    PARSING DOSSIER
// ====================================================================

// transforme un objet dossier sorti de GTS en un objet utilisable pour le rendu ejs puis pdf
// si refac = true, on parse spécialement pour la refacturation
function parseDossierObj(dossier) {
  let date_emission = (dossier.date_emission) ? dossier.date_emission : moment().format('DD-MMM-YYYY');
  console.log("amount_currency", dossier.amount_currency)
  console.log("other_currency", dossier.other_currency)
  return {
    fact_num: dossier.fact_num,
    refact_num: dossier.refact_num, // utilisé uniquement pour la refac éventuelle
    agency_address: parseAddress(dossier),
    voucher_num: dossier.voucher_num,
    group_name: dossier.label,
    dossier_num: dossier.id,
    date_format1: date_emission,
    responsable: dossier.responsable,
    date_FR: dateLang(dossier.date, 'fr'),
    date_EN: dateLang(dossier.date, 'en'),
    global_pax: dossier.pax,
    activities: parseActivities(dossier),
    invoices: parseInvoices(dossier),
    prix_avant_acompte: computePrixAvantAcompte(dossier),
    acompte: int2MoneyString(dossier.acompte),
    prix_final: computePrixFinal(dossier),
    bank_account: dossier.bank_account,
    amount_currency: (int2MoneyString(dossier.amount_currency) || 0),
    other_currency: (dossier.other_currency || '')
  }
}

function computePrixFinal(dossier) {
  var prix = 0;
  dossier['invoice'].forEach(presta => {
    prix += presta.price_per_pax * presta.pax
  });
  return int2MoneyString(prix - dossier.acompte);
}

function computePrixAvantAcompte(dossier) {
  var prix = 0;
  dossier['invoice'].forEach(presta => {
    prix += presta.price_per_pax * presta.pax
  });
  return int2MoneyString(prix);
}

function parseInvoices(dossier) {
  // si refac = true, on change le prix qd c'est des packs
  return _.map(dossier['invoice'], presta => {
    return {
      name: parsePrestation(presta, dossier.agency.name),
      price_per_pax: int2MoneyString(presta.price_per_pax),
      pax: presta.pax,
      price_total: int2MoneyString(presta.price_per_pax * presta.pax)
    }
  })
}

function parsePrestation(presta, agency_name) {
  var code = presta['code'];
  if (code == "CAFGPE") return "Menu 3 groupe";
  else if (code == "CAF3CPENFG") return "Menu 3 groupe";
  else if (code == "CAFPACK3") return "Pack 3 groupe";
  else if (code == "CAF3CPADUG") return "Menu 2 groupe";
  else if (code == "CAFPACK2") return "Pack 2 groupe";
  else if (code == "CAF3CHDGP") return "Menu 1 groupe";
  else if (code == "CAFPACK1") return "Pack 1 groupe";
  else if (code == "BIL100") return "Route 3";
  else if (code == "BIL102") return "Route 2";
  else if (code == "BIL101") return "Route 1";
  else if (code == 'DON' && agency_name == "OPHIR-PELTOURS") return "Visit of Nazareth";
  else return code;
}

function parseActivities(dossier) {
  var activities = _.map(dossier['activities'], activity => {
    return {
      name: parseActivity(activity, dossier.agency.name),
      pax: dossier.pax,
      date: moment(activity.date, 'YYYYMMDD').format('DD-MM-YYYY'),
      time: moment(activity.time, 'HHmm').format("HH:mm")
    }
  })
  // on enlève les DISCARD
  activities = _.filter(activities, activity => {
    return !/^DISCARD /gi.test(activity.name)
  })
  // on enlève les doublons
  return _.uniqBy(activities, 'name')
}

function parseActivity(activity, agency_name) {
  // TODO all raw strings in the code like in this function, should be put in a config file !
  // on affiche un nom correct pour l'activité, et on ajoute "DISCARD" (au début!) si on ne veut pas l'afficher sur la facture
  var code = activity['espace'];
  var theme = activity['theme'];
  if (code == "CAF" && /(302|303)/gi.test(theme)) {
    if (moment(activity.time, 'HHmm').isBefore(moment("1630", 'HHmm'))) return "Lunch";
    else return "Dinner";
  } else if (code == "CAF" && theme == "301") return "DISCARD Breakfast";
  else if (code == "CAF" && theme == "304") return "DISCARD Coffee pause";
  else if (code == "AUD" && theme == "002") return "Room rental";
  else if (code == "JAR") return "DISCARD Visit of the gardens";
  else if (code == "CHA" && theme == "102") return "Holy Mass in the Chapel";
  else if (code == "FOU" && theme == "001") return "DISCARD Visit excavation";
  else if (code == "CHA" && /(101|103)/gi.test(theme)) return "DISCARD Visit of the Chapel and gardens";
  else if (code == "SMM" && /(401|402|410|408)/gi.test(theme)) return "Visit Multimedia Show";
  else if (code == "MDN" && theme == "001" && agency_name == "OPHIR-PELTOURS") return "Visit of Nazareth";
  else if (code == "MDN" && theme == "001") return "Visit of the center";
  else if (code == "C1" && theme == "002") return "Location C1";
  else if (code == "C1" && theme == "201") return "Conférence C1";
  else if (code == "AUD" && theme == "002") return "Location Auditorium";
  else return "Visit of the center";
}

function parseAddress(dossier) {
  var address = dossier.agency;
  var html_address = (address.name || '') + "<br>" + (address.street || '') + "<br>" + (address.postalcode || '');
  if (address.postalcode) html_address += " ";
  html_address += (address.city || '');
  if (address.postalcode && address.country) html_address += '<br>' + address.country;
  return html_address
}

// renvoie une date string de type "20180107" en format joli dans la langue indiquée, par ex "7 janvier 2018"
function dateLang(date_s, lang) { // lang = 'fr' | 'en' | 'de' | ...
  moment.locale(lang);
  return moment(date_s, 'YYYYMMDD').format("D MMMM YYYY")
}

// transforme un nombre comme 1234.567 en monétaire joli : "1 234.56"
function int2MoneyString(nb) {
  var n = Math.abs(nb);
  var partieEntiere = parseInt(n);
  var partieDecimale = Math.round((n - partieEntiere) * 100);
  if (partieDecimale < 10) partieDecimale = "0" + partieDecimale;

  var left = parseInt(partieEntiere / 1000);
  var mem_partent = partieEntiere;
  var s = "";
  var mem = left;
  if (left == 0) s = partieEntiere.toString();
  while (left > 0) {
    s = threePad(mem_partent - left * 1000) + " " + s;
    mem_partent = parseInt(mem_partent / 1000);
    mem = left;
    left = parseInt(left / 1000)
  }
  if (partieEntiere > 999) s = mem + " " + s;
  if (s == "") s = "0";
  s = s.trim() + "." + partieDecimale;
  if (nb < 0) s = '-' + s;
  return s;
}

function threePad(i) {
  var s = i.toString();
  while (s.length < 3) s = '0' + s;
  return s
}

// ====================================================================
//                    END PARSING DOSSIER
// ====================================================================

function addInfoToDossier(dossier, opt) {
  let new_dossier = Object.assign({}, dossier);
  // écrase et ajoute des informations dans dossier à partir de opt
  Object.getOwnPropertyNames(opt).forEach(attr => {
    if (opt[attr]) new_dossier[attr] = opt[attr]
  })
  // if (opt.fact_num) new_dossier['fact_num'] = opt.fact_num;
  // if (opt.fact_num) console.log("Attention, le numéro de facture a été forcé à " + opt.fact_num + " au lieu de " + dossier.fact_num);
  // if (opt.refact_num) new_dossier['refact_num'] = opt.refact_num;
  // if (opt.refact_num) console.log("Attention, le numéro de refacturation a été forcé à " + opt.refact_num + " au lieu de " + dossier.refact_num);
  // if (opt.date_emission) new_dossier['date_emission'] = opt.date_emission;
  // if (opt.bank_account) new_dossier['bank_account'] = opt.bank_account;
  // if (opt.bank_account) new_dossier['bank_account'] = opt.bank_account;
  new_dossier['responsable'] = (opt.responsable || dossier.responsable.prenom + ' ' + dossier.responsable.nom);
  new_dossier['voucher_num'] = opt.voucher_num;
  new_dossier['acompte'] = (opt.acompte || 0);
  if (opt.pax) {
    new_dossier['pax'] = parseInt(opt.pax);
    for (var i = 0; i < new_dossier['invoice'].length; i++) new_dossier['invoice'][i].pax = opt.pax;
  }
  return new_dossier
}

function modifyPricesRefac(prestas_list) {
  var new_prestas = [];
  prestas_list.forEach(presta => {
    if (presta['code'] in PARAM.refac_prices) presta['price_per_pax'] = PARAM.refac_prices[presta['code']];
    new_prestas.push(presta)
  })
  return new_prestas;
}

// renvoie la liste des codes prestations refacturables du dossier
function getRefacPrestaList(dossier) {
  var refac = _.filter(dossier['invoice'], presta => PARAM.prestas_refacturables.indexOf(presta['code']) >= 0);
  return refac;
}

// comme pour getRefacPrestaList mais avec les activités au lieu des prestations
function getRefacActivityList(dossier) {
  return _.filter(dossier['activities'], activity => {
    return activity['espace'] == 'CAF' && /(302|303)/gi.test(activity['theme'])
  })
}

function getDossierObj(dossiernum_or_obj) {
  if (typeof dossiernum_or_obj == 'string') {
    if (dossiernum_or_obj.length == 4) dossiernum_or_obj = "TC0" + dossiernum_or_obj + "*01";
    return dbfact.getDossier(dossiernum_or_obj)
  } else {
    return Promise.resolve(dossiernum_or_obj)
  }
}

function genPDFInvoiceNames(dossier_gts) {
  // renvoie le nom du fichier PDF pour la facturation et la refacturation
  var name = dossier_gts.agency.name.replace(/[^A-z\-\s0-9]/gi, '');
  if (dossier_gts.voucher_num) name += " voucher " + dossier_gts.voucher_num.replace(/[^A-z\-\s0-9]/gi, '') + ".pdf";
  else name += ".pdf";
  return {
    fact: dossier_gts.fact_num + " " + name,
    refact: dossier_gts.refact_num + " " + name
  };
}

// renvoie promise avec le prochain numéro de facture à émettre
// si annee est null, renvoie l'annee courante
function nextFactNum(mydir_list, annee = null) {
  if (!annee) annee = moment().format("YYYY");
  else annee = annee.toString();
  if (!mydir_list) mydir_list = [default_frat_dir, default_cimdn_dir];
  // on teste si les dossiers existent bien
  var allareDirs = _.reduce(_.map(mydir_list, mydir => isDir(mydir)), (sum, b) => sum && b);
  if (!allareDirs) return Promise.reject("'" + mydir_list.join(", ") + "' contains paths that are not a directory ! (in nextFactNum)");
  // on ajoute l'année à la suite des chemins vers les dossiers et on reteste si les dossiers existent bien
  mydir_list = _.map(mydir_list, mydir => path.join(mydir, annee));
  allareDirs = _.reduce(_.map(mydir_list, mydir => isDir(mydir)), (sum, b) => sum && b);
  if (!allareDirs) return Promise.reject("'" + mydir_list.join(", ") + "' contains paths that are not a directory ! (in nextFactNum)");
  // si l'année en input est incohérente on renvoie une erreur également
  var delta = parseInt(moment().format('YYYY')) - parseInt(annee);
  if (delta > 1 || delta < 0) return Promise.reject("Impossible d'émettre une facture pour l'année " + annee + ". Voir fonction nextFactNum dans services/emit_invoice.js");

  // renvoie le prochain numero de facture pour chaque dossier
  var myPromises = [];
  mydir_list.forEach(mydir => {
    var p = new Promise((resolve, reject) => {
      fs.readdir(mydir, (err, files) => {
        if (err) {
          reject(err)
          return
        }
        var maxi_fact_num = 0;
        files.sort().forEach(file => {
          if (/^F.+\.pdf$/g.test(file)) {
            var res = /^F\s?([0-9]{4,5})/g.exec(file);
            if (res && res.length > 1) {
              var curr_num = parseInt(res[1]);
              if (curr_num > maxi_fact_num) maxi_fact_num = curr_num;
            }
          }
        });

        if (maxi_fact_num <= 0) {
          // si on est dans le dossier frat, c'est spécial, il y a l'année qui rentre en considération
          if (mydir == default_frat_dir) resolve("F " + annee.substr(2) + "001");
          // sinon on met simplement 0001
          else resolve("F 0001");
        } else {
          var nextnum = "F " + (maxi_fact_num + 1).toString();
          resolve(nextnum)
        }
      })
    });
    myPromises.push(p)
  })
  return Promise.all(myPromises);
}

function isDir(path) {
  try {
    var d = fs.lstatSync(path).isDirectory();
    return d
  } catch (e) {
    if (e.code == 'ENOENT') {
      return false
    } else {
      return false
    }
  }
}


module.exports = {
  genInvoice: genInvoice
}

// ===================================================================
//                            TESTS
// ===================================================================

// ============ test moneystring
// var money = [0, 2, 8000, 54.123, 1050.013, 78.656 -5.2, 100.2, 12355.23566, 12345678, -78965.2];
// for(var i = 0; i < money.length; i++) console.log(money[i], " => ", int2MoneyString(money[i]));

// ============ nextFactNum TEST :
// var test_nextfactnum = [{
//   mydir_list: null,
//   annee: null
// }, {
//   mydir_list: [null, null],
//   annee: null
// },
// {
//   mydir_list: [default_cimdn_dir, default_frat_dir],
//   annee: 2017
// },
// {
//   mydir_list: null,
//   annee: 2222
// }];
// test_nextfactnum.forEach((test, i) => {
//   nextFactNum(test.mydir_list, test.annee).then(r => {
//     console.log("\n\n=========== TEST " + i + " ============");
//     console.log(test)
//     console.log("\n------ RESULT : ------");
//     console.log(r)
//   }).catch(e => {
//     console.log("\n\n=========== TEST " + i + " ============");
//     console.log(test);
//     console.log("\n------ ERROR : ------");
//     console.log(e)
//   })
// })

// ========================= BIG TEST : you can try to test these dossiers : genInvoice("2761" || "TC02234*01" || "2656")
// pour la refac on peut tester "2687" ou "2579" qui ont un PACK3
// genInvoice("2579", {
//   debug: false,
//   voucher_num: "2018-021",
//   annee: "2017",
//   pdf_dir_save: __dirname
// }).then(pdf_path => {
//   console.log("OK ! Grazie Signore !", pdf_path)
// }).catch(e => console.log("Error in getInvoice : ", e))
