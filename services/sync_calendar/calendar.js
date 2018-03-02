/*
 * In this module we deal with the actual synchronisation of events with Google Calendar
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const moment = require('moment')
const google = require('googleapis')
const googleAuth = require('google-auth-library')
const calendar = google.calendar('v3');
const gts = require('./gts_events.js')

const TMP_FOLDER = path.join(__dirname, 'tmp')
const CALENDAR_ID = 'c7694ov0cve44f9tfhk1evebqs@group.calendar.google.com';
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(__dirname, '_credentials', 'token_accueil.json')
const KEYS = require('./_credentials/client_secret_accueil.json');
let GAUTH;

const DEBUG = true

// we create the tmp dir if not created already
try {
  fs.mkdirSync(TMP_FOLDER);
} catch (err) {

}

// getFutureEvents().then(r => console.log(r.length)).catch(e => console.log(e))
sync().then(r => console.log(`\nAll ${r.length} events synced with Google Calendar !`)).catch(e => console.log(e, "ERROR"))

async function sync() {
  GAUTH = await authenticate()
  let list_events = await gts.getFutureEvents()
  if (DEBUG) fs.writeFile(path.join(TMP_FOLDER, '40_new_events.json'), JSON.stringify(list_events, null, '\t'), 'utf8', _ => 1)
  console.log(`${list_events.length} future events found in GTS`)
  let existing_events = await getFutureEvents()
  if (DEBUG) fs.writeFile(path.join(TMP_FOLDER, '50_existing_events.json'), JSON.stringify(existing_events, null, '\t'), 'utf8', _ => 1)
  console.log(`${existing_events.length} future events found in the Calendar\n`)
  return syncCore(list_events, existing_events)
}

function syncCore(list_events, existing_events) {
  let myPromises = []
  let compteur = 0
  let status = 0
  // on ajoute les événements modifiés ou ajoutés
  list_events.forEach(ev => {
    if (!eventExistsInList(ev, existing_events)) {
      let p = addEventWithRetry(ev)
      p.then(_ => {
        status++;
        printText(`Sync Status : ${status}/${compteur}`)
      })
      p.catch(e => console.log(e))
      compteur++;
      printText(compteur.toString())
      myPromises.push(p)
    }
  })
  // on supprime les événements en trop
  existing_events.forEach(ev => {
    if (!eventExistsInList(ev, list_events)) {
      let p = deleteEventWithRetry(ev)
      p.then(_ => {
        status++;
        printText(`Sync Status : ${status}/${compteur}`)
      })
      p.catch(e => console.log(e))
      compteur++;
      printText(compteur.toString())
      myPromises.push(p)
    }
  })

  return Promise.all(myPromises)
}

async function getFutureEvents() {
  GAUTH = await authenticate()
  return new Promise((resolve, reject) => {
    // authenticate().then(auth => {
    calendar.events.list({
      auth: GAUTH,
      calendarId: CALENDAR_ID,
      timeMin: moment().startOf('day').toISOString(),
      maxResults: 1000,
      singleEvents: true,
      orderBy: 'startTime'
    }, function(err, response) {
      if (err) {
        reject(err)
      } else {
        resolve(response.items);
      }
    })
    // })
  })
}

async function addEventWithRetry(ev) {
  GAUTH = await authenticate()
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      calendar.events.insert({
        "calendarId": CALENDAR_ID,
        'auth': GAUTH,
        'resource': ev
      }, function(err, response) {
        if (err) {
          setTimeout(() => {
            addEventWithRetry(ev).then(res => {
              resolve(res)
            }).catch(err => {
              reject(err)
            })
          }, parseInt(Math.random() * 3000))
        } else {
          resolve(response.items);
        }
      });
    }, parseInt(Math.random() * 5000));
  })
}

async function deleteEventWithRetry(ev) {
  GAUTH = await authenticate()
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      calendar.events.delete({
        auth: GAUTH,
        calendarId: CALENDAR_ID,
        eventId: (ev.id || ev)
      }, function(err, response) {
        if (err) {
          setTimeout(() => {
            deleteEventWithRetry(ev).then(res => {
              resolve(res)
            }).catch(err => {
              reject(err)
            })
          }, parseInt(Math.random() * 3000))
        } else {
          if (response && response.items) resolve(response.items);
          else resolve([])
        }
      });
    }, parseInt(Math.random() * 5000));
  })
}

// dit si l'événement ev existe dans la liste d'événements list_events
function eventExistsInList(ev, list_events) {
  for (e of list_events) {
    if (eventsEqual(e, ev)) return true
  }
  return false
}

function eventsEqual(ev1, ev2) {
  return ev1.summary == ev2.summary && ev1.description == ev2.description &&
    ev1.start && ev2.start && ev1.end && ev2.end &&
    ev1.start.dateTime && ev1.end.dateTime && ev2.start.dateTime && ev2.end.dateTime &&
    moment(ev1.start.dateTime).isSame(ev2.start.dateTime) &&
    moment(ev1.end.dateTime).isSame(ev2.end.dateTime)
}


// ==========================================================================
//                        GOOGLE AUTH
// ==========================================================================

// Create and authorize an OAuth2 client
async function authenticate() {
  if (GAUTH && GAUTH.credentials) return GAUTH;
  let clientSecret = KEYS.installed.client_secret
  let clientId = KEYS.installed.client_id
  let redirectUrl = KEYS.installed.redirect_uris[0]
  let auth = new googleAuth();
  GAUTH = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  try {
    let token_raw = fs.readFileSync(TOKEN_PATH)
    GAUTH.credentials = JSON.parse(token_raw);
    return GAUTH
  } catch (e) {
    return getNewToken(GAUTH);
  }
}

// Get and store new token after prompting for user authorization
function getNewToken(oauth2Client) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve, reject) => {
    rl.question('Enter the code from that page here: ', function(code) {
      rl.close();
      oauth2Client.getToken(code, function(err, token) {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          reject(err)
        }
        oauth2Client.credentials = token
        GAUTH = oauth2Client
        storeToken(token)
        resolve(oauth2Client)
      })
    })
  })
}

function storeToken(token) {
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

function printText(texte) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(texte);
}

module.exports = {
  sync: sync
}
