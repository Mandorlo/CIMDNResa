const path = require('path')
const PARAMJSON = require('./param.json')

PARAMJSON.invoice.re_fact_num = new RegExp(PARAMJSON.invoice.re_fact_num.regex, PARAMJSON.invoice.re_fact_num.flags)

PARAMJSON.downloads_dir = path.join(__dirname, PARAMJSON.downloads_dir)

module.exports = PARAMJSON
