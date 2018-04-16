// Module to log events (initially written for logging startup.js function calls)

const fs = require('fs')
const path = require('path')
const LOG_PATH = path.join(__dirname, './log.txt')
const moment = require('moment')
const param = require('../param/param.js')

let lock = false;
let streamLog = null;

function write(title, data) {
  if (!lock) {
    setTimeout(_ => write(title, data), 500)
    return
  }
  if (!param.logging) return;
  if (typeof data != 'string') data = JSON.stringify(data);
  data = `${moment().format('YYYY-MM-DD HH:mm:ss')} == ${title} == ${data}\n`

  if (streamLog === null) {
    streamLog = fs.createWriteStream(LOG_PATH, {
      flags: 'a',
      encoding: 'utf8'
    })
  }
  lock = true

  try {
    streamLog.write(data);
  } catch(e) {
    streamLog = null;
    console.log("ERROR couldn't write log, stream reinitialized")
    lock = false
    setTimeout(_ => write(title, data), 2000)
  }
  lock = false
  // stream.end();
}

module.exports = {
  write: write
}
