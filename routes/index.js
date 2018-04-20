var express = require('express');
var router = express.Router();
const updateResa = require('../services/resa/updateResa.js')

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', {
//     title: 'Express'
//   });
// });

router.get('/', (req, res, next) => {
  const data = {
    otherData: 'Something Else'
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

// crée des routes automatiques pour la function fn
function addRoute(fn, opt) {
  let url = `/RFC/${fn.name}`
  for (let i = 0; i < fn.length; i++) {
    url += `/:arg${i}`
  }
  console.log('Adding auto-route ' + url)
  router.get(url, (req, res, next) => {
    let args = []
    let i = 0
    for (let arg of Object.getOwnPropertyNames(req.params)) {
      let v = req.params[arg]
      console.log('ARG before', v)
      if (opt && opt.length && opt.length > i && opt[i]) v = forceType(v, opt[i]);
      console.log('ARG', v)
      args.push(v)
      i++
    }
    console.log(args, fn.name, fn.length)

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
  return v
}

addRoute(updateResa.test, ['number', 'number', 'number'])
addRoute(updateResa.closeResa, ['string', 'object'])


module.exports = router;
