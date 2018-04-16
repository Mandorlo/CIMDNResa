const fs = require('fs')
const path = require('path')

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

function clearFolder(directory) {
  if (!isDir(directory)) return Promise.reject(`in files > clearFolder : '${directory}' is not a valid directory path`);
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) {
        reject(err)
        return
      }

      let myPromises = []
      for (const f of files) {
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

      Promise.all(myPromises).then(r => {
        resolve(1)
      }).catch(e => reject(e))

    }) // end fs.readdir
  })
}

module.exports = {
  isDir: isDir,
  clearFolder: clearFolder
}
