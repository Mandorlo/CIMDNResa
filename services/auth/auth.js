// load the things we need
const fs = require('fs')
const path = require('path')
const PARAM = require('../param/param.js')
const db = require('./auth.json')
var bcrypt   = require('bcrypt-nodejs')
const uuid = require('uuid')
const _ = require('../util/util.js')

// middleware function to check for logged-in users
function sessionChecker(req, res, next) {
    console.log('sessionChecker', req.session.user, req.cookies.user_sid)
    if (PARAM.admin && !PARAM.admin.enable_auth) {
        console.log('ok authentication is deactivated, behaving as if user is connected')
        next()
    } else if ((req.session.user && req.cookies.user_sid)) {
        if (PARAM.admin.page_roles[req.url]) {
            console.log('ok the user is connected, checking roles for url ', req.url, req.session.email)
            if (db[req.session.email] && db[req.session.email].roles && _.intersection(db[req.session.email].roles, PARAM.admin.page_roles[req.url]).length > 0) {
                console.log(`ok user ${req.session.email} can go to page ${req.url}`)
                next()
            }  else {
                console.log(`user ${req.session.email} has no right to go to page ${req.url}`)
                res.redirect('/home')
            }
        } else {
            console.log('ok user is connected')
            next();
        }
    } else {
        res.redirect('/login')
    }    
};

// data = {email: "", password: ""}
async function createUser(data) {
    console.log("INFO userCreate(" + JSON.stringify(data) + ")")
    if (!db[data.email]) {
        db[data.email] = {
            email: data.email, 
            hash: bcrypt.hashSync(data.password),
        }
        fs.writeFileSync(path.join(__dirname, 'auth.json'), JSON.stringify(db, null, '\t'), 'utf8')
        db[data.email].sessionId = uuid() + data.email
        return db[data.email]
    } else {
        console.log(`user with email ${data.email} exists already`)
        db[data.email].sessionId = uuid() + data.email
        return db[data.email]
    }
}

async function findUser(email, password) {
    console.log(`INFO userFind(${email}, ${password}) db=${Object.getOwnPropertyNames(db)}}`)
    if (!db[email]) return null;
    console.log("found user " + email + " now checking password")
    if (bcrypt.compareSync(password, db[email].hash)) {
        db[email].sessionId = uuid() + email;
        return db[email];
    }
    console.log("password not matching...")
    return null
}

module.exports = {
    sessionChecker,
    createUser,
    findUser
}