var express = require('express');
var router = express.Router();
const resa = require('../services/resa/resa.js')
const updateResa = require('../services/resa/updateResa.js')
const emitResa = require('../services/resa/emit_confirmation.js')
const guides = require('../services/stats/guides.js')
const PARAM = require('../services/param/param.js')
const auth = require('../services/auth/auth.js')
let sessionChecker = auth.sessionChecker;

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', {
//     title: 'Express'
//   });
// });

router.get('/', (req, res, next) => {
  let data = {
    loggedin: Boolean(req.session && req.cookies && req.session.user && req.cookies.user_sid)
  };
  const vueOptions = {
    head: {
      title: 'CIMDN Resa',
      meta: [

      ]
    }
  }
  res.renderVue('main', data, vueOptions);
});

router.get('/home', (req, res, next) => {
  let data = {
    loggedin: Boolean(req.session && req.cookies && req.session.user && req.cookies.user_sid)
  };
  const vueOptions = {
    head: {
      title: 'CIMDN - Réservations'
    }
  }
  if (req.query.welcome) data.welcomeMsg = req.query.welcome;
  res.renderVue('main', data, vueOptions);
});

router.get('/admin', sessionChecker, (req, res, next) => {
  res.renderVue('pages/admin');
});

router.get('/liens', (req, res, next) => {
  let data = {
    loggedin: Boolean(req.session && req.cookies && req.session.user && req.cookies.user_sid),
    liens_utiles: PARAM.liens_utiles
  };
  res.renderVue('pages/liensUtiles', data);
});

// crée des routes automatiques pour la function fn
function addRoute(fn, opt) {
  let url = `/RFC/${fn.name}`
  let fn_length = fn.length;
  if (opt && opt.length) fn_length = opt.length;

  for (let i = 0; i < fn_length; i++) {
    url += `/:arg${i}`
  }
  console.log('Adding auto-route ' + url)
  router.get(url, (req, res, next) => {
    let args = []
    let i = 0
    for (let arg of Object.getOwnPropertyNames(req.params)) {
      let v = req.params[arg]
      if (opt && opt.length && opt.length > i && opt[i]) v = forceType(v, opt[i]);
      console.log('ARG', v)
      args.push(v)
      i++
    }
    console.log(args, fn.name, fn_length)

    fn(...args).then(resultat => {
      if (typeof resultat == 'number') resultat = resultat.toString();
      res.send(resultat)
    }).catch(err => {
      console.log(err)
      res.send({
        error: true,
        details: err
      })
    })
  })
}
function forceType(v, typ) {
  if (typ == 'string') return v;
  if (typ == 'number') return parseFloat(v);
  if (typ == 'object') return JSON.parse(v);
  if (typ == 'boolean') return v.toLowerCase() == 'true';
  return v
}

addRoute(PARAM.setSignup)
addRoute(PARAM.setSignup, ['boolean'])
addRoute(PARAM.setEnableAuth)
addRoute(PARAM.setEnableAuth, ['boolean'])

addRoute(resa.getFutureResas, [])

addRoute(updateResa.test, ['number', 'number', 'number'])
addRoute(updateResa.closeResa, ['string', 'object'])
addRoute(updateResa.updateResa, ['string', 'object', 'object'])

addRoute(guides.get, ['string'])
addRoute(guides.updateDB)

addRoute(emitResa.genConfirmation, ['string', 'object'])

addRoute(auth.getAllUsers)
addRoute(auth.createUser, ['object'])
addRoute(auth.deleteUser, ['string'])

module.exports = router;
