const path = require('path')
const PARAMJSON = require('./param.json')

PARAMJSON.invoice.re_fact_num = new RegExp(PARAMJSON.invoice.re_fact_num.regex, PARAMJSON.invoice.re_fact_num.flags)
PARAMJSON.downloads_dir = path.join(__dirname, PARAMJSON.downloads_dir)
PARAMJSON.debug_dir = path.join(__dirname, PARAMJSON.debug_dir)

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
