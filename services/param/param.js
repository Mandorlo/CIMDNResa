const fs = require('fs')
const path = require('path')
const PARAMJSON = require('./param.json')
const LIENS_UTILES = require('./liens_utiles.json')

const PARAMJSON_RAW = JSON.parse(JSON.stringify(PARAMJSON))

PARAMJSON.invoice.re_fact_num = new RegExp(PARAMJSON.invoice.re_fact_num.regex, PARAMJSON.invoice.re_fact_num.flags)
PARAMJSON.downloads_dir = path.join(__dirname, PARAMJSON.downloads_dir)
PARAMJSON.debug_dir = path.join(__dirname, PARAMJSON.debug_dir)
PARAMJSON.liens_utiles = LIENS_UTILES

// PARAMJSON.parse_prestation = {
//     'CAFGPE': 'Menu 3 groupe',
//     'CAF3CPENFG': 'Menu 3 groupe',
//     'CAFPACK3': 'Pack 3 groupe',
//     'CAF3CPADUG': 'Menu 3 groupe',
//     'CAFPACK2': 'Pack 2 groupe',
//     'CAF3CHDGP': 'Menu 1 groupe',
//     'CAFPACK1': 'Pack 1 groupe',
//     'BIL100': 'Route 3',
//     'BIL102': 'Route 2',
//     'BIL101': 'Route 1',
//     '_fun'
// }

module.exports = PARAMJSON

async function setEnableAuth(v = null) {
    if (v === null) return PARAMJSON.admin.enable_auth;
    if (typeof v != 'boolean') throw "in setEnableAuth, param is not a boolean";
    PARAMJSON.admin.enable_auth = v
    PARAMJSON_RAW.admin.enable_auth = v
    fs.writeFileSync(path.join(__dirname, 'param.json'), JSON.stringify(PARAMJSON_RAW, null, '\t'))
    return PARAMJSON.admin.enable_auth
}

async function setSignup(v = null) {
    if (v === null) return PARAMJSON.admin.enable_signup;
    if (typeof v != 'boolean') throw "in setSignup, param is not a boolean";
    PARAMJSON.admin.enable_signup = v
    PARAMJSON_RAW.admin.enable_signup = v
    fs.writeFileSync(path.join(__dirname, 'param.json'), JSON.stringify(PARAMJSON_RAW, null, '\t'))
    return PARAMJSON.admin.enable_signup
}

module.exports.setSignup = setSignup;
module.exports.setEnableAuth = setEnableAuth;