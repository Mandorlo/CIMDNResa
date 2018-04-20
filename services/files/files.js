const fs = require('fs')
const path = require('path')
const util = require('util')
const moment = require('moment')
const log = require('../log/log.js')
const param = require('../param/param.js')

// tells if @path is a directory
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

function fileDate(file_path) {
  if (!fs.existsSync(file_path)) return -1;
  try {
    let stats = fs.statSync(file_path);
    return moment(stats.mtime)
  } catch(e) {
    return -2
  }
}

function clearFolder(directory, filter = null) {
  if (!isDir(directory)) return Promise.reject(`in files > clearFolder : '${directory}' is not a valid directory path`);
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) {
        reject(err)
        return
      }

      let myPromises = []
      for (const f of files) {
        if (typeof filter == 'function' && filter(f) || filter === null) {
          let p = new Promise((resol, rejec) => {
            fs.unlink(path.join(directory, f), err => {
              if (err) {
                rejec(err)
                return
              }
              resol(1)
            })
          })
          myPromises.push(p)
        }
      }

      Promise.all(myPromises).then(r => {
        resolve(1)
      }).catch(e => reject(e))

    }) // end fs.readdir
  })
}

// nettoyage du dossier de downloads
function clearDownloadFolder() {
  clearFolder(param.downloads_dir, (f) => {
    let d = fileDate(path.join(param.downloads_dir, f))
    if (d.format) console.log(d.format('YYYY-MM-DD'), moment().diff(d, 'd'), f);
    if (d !== -1 && moment().diff(d, 'd') < 30 || d === -2) return false;
    return true
  }).then(r => {
    log.write('INFO', 'Clear Download Folder Success')
  }).catch(e => {
    log.write('ERROR', e)
  })
}

module.exports = {
  isDir: isDir,
  clearFolder: clearFolder,
  date: fileDate,
  clearDownloadFolder: clearDownloadFolder
}
