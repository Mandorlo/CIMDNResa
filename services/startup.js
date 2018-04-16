/* This is executed on server startup or on a certain interval */
// this is run in app.js

const log = require('./log/log.js')
const googleCalendar = require('./sync_calendar/calendar.js')
const files = require('./files/files.js')
const param = require('./param/param.js')
const moment = require('moment')

let clocks = []

function run() {
  // on exécute régulièrement une synchronisation avec le calndrier Google
  scheduleInterval(syncCal, {
    interval: {
      unit: 'min',
      val: 30
    },
    filter: () => {
      return moment().format('HH:mm:ss') < '21:00:00' && moment().format('HH:mm:ss') > '08:30:00'
    }
  })

  // on exécute régulièrement un nettoyage du dossier de download
  scheduleInterval(clearDownloadFolder, {
    interval: {
      unit: 'month',
      val: 3
    }
  })
}

// synchronisation du calendrier Google
function syncCal() {
  googleCalendar.sync()
    .then(r => {
      log.write('Google Calendar Sync Success', `All ${r.length} events synced with Google Calendar !`)
    })
    .catch(e => {
      log.write("Google Calendar Sync FAILURE", e)
    })
}

// nettoyage du dossier de downloads
function clearDownloadFolder() {
  files.clearFolder(param.downloads_dir).then(r => {
    log.write('Clear Download Folder Success', '')
  }).catch(e => {
    log.write('Clear Download Folder FAILURE', e)
  })
}


// ====================================================================
//                HELPER FUNCTIONS
// ====================================================================

// helper function to fire function at some interval
// fn is called without arguments
function scheduleInterval(fn, opt) {
  let opt_default = {
    interval: {
      unit: 'hour', // second, min, hour, day, month
      val: 0
    },
    filter: null // fonction sans arguments
  }
  opt = Object.assign(opt_default, opt)
  if (opt.interval.val > 0) {
    let myInterval = convertToMs(opt.interval.val, opt.interval.unit);
    if (opt.filter === null) {
      clocks.push(setInterval(fn, myInterval));
      return clocks.length - 1;
    } else if (typeof opt.filter == 'function') {
      let clock = setInterval(() => {
        if (opt.filter()) {
          fn()
        }
      }, myInterval)
      return clocks.length - 1;
    }
  }
}

function clearClock(n = null) {
  if (n === null) {
    for (let c of clocks) {
      clearInterval(c)
    }
    clocks = []
  } else if (n < clocks.length) {
    clearInterval(clocks[n])
    clocks.splice(n, 1)
  } else {
    console.log("WARNING : invalid clock index " + n)
  }
}

// converts to ms (unit = 'hour', 'min', 'second', 'day', 'month')
function convertToMs(n, unit) {
  unit = unit.toLowerCase();
  if (unit == 'second' || unit == 's') return n * 1000;
  else if (unit == 'minute' || unit == 'min') return n * 1000 * 60;
  else if (unit == 'hour' || unit == 'h') return n * 1000 * 60 * 60;
  else if (unit == 'day' || unit == 'd') return n * 1000 * 60 * 60 * 24;
  else if (unit == 'month') return n * 1000 * 60 * 60 * 24 * 30;
}

module.exports = {
  scheduleInterval: scheduleInterval,
  clearClock: clearClock,
  run: run
}
