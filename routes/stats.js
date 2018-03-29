const express = require('express');
const router = express.Router()
const stats = require('../services/stats/stats.js')

router.get('/', (req, res, next) => {
  const data = {
    otherData: 'Something Else'
  }
  const vueOptions = {
    head: {
      title: 'CIMDN Statistiques'
    }
  }
  res.renderVue('stats', data, vueOptions);
});


router.get('/query/:stat_name', async (req, res, next) => {
  let stat_name = req.params.stat_name;
  try {
    let stat_res = await stats.get(stat_name)
    res.send(stat_res)
  } catch (e) {
    res.send({error: 'INVALID_PARAM', description: e})
  }
})

router.get('/query/flex/:x/:y/:f', async (req, res, next) => {
  try {
    let stat_res = await stats.getFlex(req.params.x, req.params.y, req.params.f)
    res.send(stat_res)
  } catch (e) {
    res.send({error: 'INVALID_PARAM', description: e})
  }
})

router.get('/query/flexdates/:y/:start/:end', async (req, res, next) => {
  try {
    // console.log("flexdates", req.params)
    let stat_res = await stats.getFlexDates(req.params.y, req.params.start, req.params.end)
    res.send(stat_res)
  } catch (e) {
    res.send({error: 'INVALID_PARAM', description: e})
  }
})

module.exports = router;
