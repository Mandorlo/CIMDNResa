const path = require('path')
const fs = require('fs')
const GPARAM = require('../param/param.js');
const dbapi = require('../db.js')
const dbfact = require('../db_invoices.js');
const resa = require('./resa.js');
const ejs2pdf = require('../pdf_renderer/ejs2pdf.js').ejs2pdf;
const emit_invoice = require('../emit_invoice.js')
const moment = require('moment')
const DEBUG = true

const confresa_template = path.join(__dirname, "../pdf_renderer/templates/pdf-template-confresa.ejs");

let QUERY_DOSSIER = `SELECT TOP 1
                        Rs_coderesa, Rs_operatcreation, Rs_libellereservation, Rs_heurearrivee, Rs_datedebut, Rs_effectif, Rs_codelangue, Rs_commentaire, Rs_codeetat, Rs_nomliv, Rs_client,
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
                        AND Rs_coderesa = '@dossier_num'
                        AND Co_code = Rs_client
                        AND Ed_code = Rs_codeetat
                        ORDER BY Rs_coderesa DESC`;


async function genConfirmation(dossier_num, opt) {
    // 0. on prépare
    opt = Object.assign({
        pdf_dir_save: GPARAM.downloads_dir
    }, opt)
    dossier_num = resa.cleanDossierNum(dossier_num)

    // 1. télécharger les données du dossier
    let dossier_obj_raw;
    try {
        dossier_obj_raw = await dbfact.getDossier(dossier_num)
    } catch(e) {
        dossier_obj_raw = await getDossier(dossier_num)
    }
    let date4pdfname = moment(dossier_obj_raw.date, "YYYYMMDD").format("DD-MM-YY")
    let agency = dossier_obj_raw.agency.name.replace(/[\/\\\*\!\?\~\&\+\=\(\)\#\@]/g, "-")
    dossier_obj = emit_invoice.parseDossierObj(dossier_obj_raw)
    dossier_obj.responsable = `${dossier_obj.responsable.prenom} ${dossier_obj.responsable.nom}`
    // on corrige l'heure de début éventuellement
    if (dossier_obj.activities.length == 1) dossier_obj.activities[0].time = moment(dossier_obj_raw.time, "HHmm").format("HH:mm");
    if (DEBUG) fs.writeFileSync(path.join(GPARAM.debug_dir, "emit_confresa_dossier.json"), JSON.stringify(dossier_obj, null, '\t'), 'utf8')

    // 2. générer le nom du fichier
    let pdf_name = `CONF RES ${dossier_num.replace('*', '-').replace("TC0", "TC ")} ${agency} ${date4pdfname}.pdf`

    // 3. générer le pdf
    // returns the pdf path and name
    let pdf_path = await ejs2pdf(confresa_template, path.join(opt.pdf_dir_save, pdf_name), dossier_obj);
    return {path: pdf_path, name: path.basename(pdf_path)}

}

// renvoie le dossier demandé prêt pour les invoices
function getDossier(dossier_num) {
    return new Promise((resolve, reject) => {
      let query = dbapi.prepareQuery(QUERY_DOSSIER, {
        dossier_num: dossier_num
      });
      dbapi.queryModel(query, dbfact.model).then(r => {
        // dbapi.close();
        if (r && r.length) resolve(r[0]);
        else console.log(r);reject("No results to getDossier (for resa confirmation) N° " + dossier_num)
      }).catch(e => {
        if (DEBUG) console.log("Error in getDossier (for resa confirmation): ", e);
        reject(e)
      });
    })
  }

//genConfirmation("TC03101*01").then(r => console.log('ok', r)).catch(err => console.log(err))

module.exports = {
    genConfirmation
}