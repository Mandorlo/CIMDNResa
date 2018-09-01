// load the things we need
const fs = require('fs')
const path = require('path')
const db = require('./auth.json')
var bcrypt   = require('bcrypt-nodejs');
const uuid = require('uuid')

// middleware function to check for logged-in users
function sessionChecker(req, res, next) {
    console.log('sessionChecker', req.session.user, req.cookies.user_sid)
    if (req.session.user && req.cookies.user_sid) {
        console.log('ok the user is connected : ', req.session.user, req.cookies.user_sid)
        //res.redirect('/home');
        next();
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