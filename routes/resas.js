const express = require('express');
const router = express.Router()
let sessionChecker = require('../services/auth/auth.js').sessionChecker;

router.get('/', sessionChecker, (req, res, next) => {
  const data = {
    otherData: 'Something Else'
  };
  const vueOptions = {
    head: {
      title: 'CIMDN Réservations'
    }
  }
  if (req.query.welcome) data.welcomeMsg = req.query.welcome;
  res.renderVue('pages/resas', data, vueOptions);
});


module.exports = router;
