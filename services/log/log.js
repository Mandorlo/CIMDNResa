// Module to log events (initially written for logging startup.js function calls)

const fs = require('fs')
const path = require('path')
const LOG_PATH = path.join(__dirname, './log.txt')
const DEBUG_DIR = path.join(__dirname, 'DEBUG')
const moment = require('moment')
const param = require('../param/param.js')
const DEBUG_BOOL = true;

let lock = false;
let streamLog = null;

function debug(filename, filedataJSON) {
  if (DEBUG_BOOL) fs.writeFileSync(path.join(DEBUG_DIR, filename), JSON.stringify(filedataJSON, null, '\t'), 'utf8')
}

function write(type, title, data) {
  if (!lock) {
    setTimeout(_ => write(type, title, data), 500)
    return
  }
  if (!param.logging) return;
  if (typeof data != 'string') data = JSON.stringify(data);
  data = `${moment().format('YYYY-MM-DD HH:mm:ss')} ::${type}:: ${title} -- ${data}\n`

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
    setTimeout(_ => write(type, title, data), 2000)
  }
  lock = false
  // stream.end();
}

module.exports = {
  write,
  debug
}
