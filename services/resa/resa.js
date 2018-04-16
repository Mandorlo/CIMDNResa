const dbapi = require('../db.js')


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
  cleanDossierNum: cleanDossierNum,
  dossierExists: dossierExists,
  getState: getState
}
