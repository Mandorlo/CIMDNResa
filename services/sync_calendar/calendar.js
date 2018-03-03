/*
 * In this module we deal with the actual synchronisation of events with Google Calendar
 */

const fs = require('fs')
const path = require('path')
const {JWT} = require('google-auth-library');
const moment = require('moment')
const gts = require('./gts_events.js')

const TMP_FOLDER = path.join(__dirname, 'tmp')
const KEYS = require('./_credentials/accueil_service_account.json');
const CALENDAR_ID = 'c7694ov0cve44f9tfhk1evebqs@group.calendar.google.com'
let GCLIENT;

const DEBUG = true
// we create the tmp dir if not created already
try {
  fs.mkdirSync(TMP_FOLDER);
} catch (err) {}

// ========================
sync().then(r => console.log(`\nAll ${r.length} events synced with Google Calendar !`)).catch(e => console.log(e, "ERROR"))
// ========================

async function sync() {
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
      let p = addEvent(ev, 10)
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
      let p = deleteEvent(ev, 10)
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
  GCLIENT = await authenticate()

  let res = await GCLIENT.request({
    url: `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`,
    params: {
      calendarId: CALENDAR_ID,
      timeMin: moment().startOf('day').toISOString(),
      maxResults: 1000,
      singleEvents: true,
      orderBy: 'startTime'
    }
  })
  return res.data.items
}

async function addEvent(ev, retry = 0) {
  if (retry < 0) throw 'Impossible to add event (number of retries exceeded) : ' + JSON.stringify(ev)
  GCLIENT = await authenticate()
  await delay(Math.random() * 1000)
  try {
    let res = await GCLIENT.request({
      url: `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`,
      method: 'POST',
      data: ev
    })
    return res.data
  } catch (e) {
    if (retry > 0) return addEvent(ev, retry - 1)
    else throw e
  }
}

async function deleteEvent(ev, retry = 0) {
  if (retry < 0) throw 'Impossible to delete event (number of retries exceeded) : ' + JSON.stringify(ev)
  GCLIENT = await authenticate()
  let eventId = (ev.id || ev)
  if (!eventId) throw "Invalid event - Unable to delete : " & JSON.stringify(ev)
  await delay(Math.random() * 1000)
  try {
    let res = await GCLIENT.request({
      url: `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events/${eventId}`,
      method: 'delete'
    })
    return res
  } catch (e) {
    if (retry > 0) return deleteEvent(ev, retry - 1)
    else throw e
  }
}

async function authenticate() {
  if (GCLIENT) return GCLIENT;
  GCLIENT = new JWT(
    KEYS.client_email,
    null,
    KEYS.private_key, ['https://www.googleapis.com/auth/calendar'],
  );
  await GCLIENT.authorize();
  return GCLIENT
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

function delay(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

function printText(texte) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(texte);
}

module.exports = {
  addEvent: addEvent,
  deleteEvent: deleteEvent,
  getFutureEvents: getFutureEvents
}
