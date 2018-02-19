const sql = require('mssql');
const fs = require('fs');
const moment = require('moment');
const _ = require('lodash');

const config = {
  user: 'IRECUSER',
  password: 'IRECSA',
  server: '10.70.20.10',
  database: 'IREC',

  options: {
    encrypt: false
  }
}

var db = [];
var mypool = null;
var DEBUG = true;

function queryModel(init_query, model) {
  return new Promise((resolve, reject) => {
    query(init_query, true).then(res => {
      // on parse chaque element renvoyé
      var myPromises = [];
      res.forEach((el, ind) => {
        // on filtre éventuellement
        if (!model.hasOwnProperty('_filter') || model['_filter'](el)) {
          var p = parseElement(el, model);
          myPromises.push(p)
        }
      })
      Promise.all(myPromises).then(values => {
        // si on a un top 1, il ne faut pas renvoyer un array mais juste l'objet :
        if (/^SELECT TOP 1 /gi.test(init_query)) resolve(values[0]);
        else resolve(values)
      }).catch(e => {
        sql.close();
        reject(e)
      })
    }).catch(e => {
      if (DEBUG) console.log("Error in queryModel");
      sql.close();
      reject(e)
    })
  })
}

// voir fonction queryModel
function parseElement(el, modele) {
  // pour chaque champ du modèle
  var newel = {}
  var myPromisesKeys = [];
  var myPromises = [];

  Object.getOwnPropertyNames(modele).forEach(model_key => {
    var sql_key = modele[model_key];
    // cas simple
    if (typeof sql_key == 'string') {
      if (!/^\_/gi.test(model_key)) newel[model_key] = el[sql_key];
      // champ simple indenté
    } else if (typeof sql_key == 'object' && !sql_key.hasOwnProperty('_query')) {
      var p = parseElement(el, sql_key);
      myPromisesKeys.push(model_key);
      myPromises.push(p)
      // champ fonction
    } else if (typeof sql_key == 'function') {
      newel[model_key] = sql_key(el)
      // champ objet avec query
    } else if (typeof sql_key == 'object' && sql_key.hasOwnProperty('_query')) {
      var q = prepareQuery(sql_key['_query'], el);
      var submodel = Object.assign({}, sql_key);
      delete submodel['_query']
      var p = queryModel(q, submodel);
      myPromisesKeys.push(model_key);
      myPromises.push(p)
    } else {
      if (DEBUG) console.log("Unknown key ", model_key, sql_key)
    }
  })

  return new Promise((resolve, reject) => {
    Promise.all(myPromises).then(values => {
      values.forEach((v, i) => {
        newel[myPromisesKeys[i]] = v
      })
      resolve(newel)
    }).catch(e => {
      e['partial'] = newel;
      reject(e)
    })
  })
}

// returns a promise with results of the query
function query(q, keepalive = false) {
  return new Promise((resolve, reject) => {
    getPool().then(pool => {
      // on lance la query
      pool.request().query(q).then(res => {
        // if (DEBUG) console.log("SQL QUERY : '" + q + "' successful ! Grazie Signore ! (" + res.recordset.length + " result(s))");
        resolve(res.recordset)
        if (!keepalive) sql.close();
      }).catch(e => {
        if (DEBUG) console.log("Error in query '" + q + "' :", e);
        if (!keepalive) sql.close();
        reject(e)
      })
    }).catch(e => {
      if (DEBUG) console.log("Error in connecting to MSSQL : ", e);
      reject(e)
    })
  })
}

// prepares a query with an Object
function prepareQuery(q, obj) {
  var newq = q;
  Object.getOwnPropertyNames(obj).forEach(champs => {
    newq = newq.replace(new RegExp("\\@" + champs, "gi"), obj[champs])
  })
  return newq
}

// connects to mssql or returns the current opened connection pool
function getPool() {
  return new Promise((resolve, reject) => {
    if (!mypool) {
      sql.connect(config).then(pool => {
        mypool = pool;
        resolve(mypool)
      }).catch(e => {
        reject(e)
      })
    } else {
      resolve(mypool);
    }
  })
}

sql.on('error', err => {
  reject({
    err: err,
    close: sql.close()
  })
})

function close() {
  sql.close()
  mypool = null;
}

module.exports = {
  query: query,
  queryModel: queryModel,
  prepareQuery: prepareQuery,
  close: close
}
