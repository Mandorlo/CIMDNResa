const express = require('express');
const router = express.Router()

// TODO this file is probably useless

router.get('/', (req, res, next) => {
  /* res.send({
    'todo': 'todo'
  }) */
  const data = {
    otherData: 'Something Else'
  };
  const vueOptions = {
    head: {
      title: 'CIMDN Réservations'
    }
  }
  res.renderVue('pages/resas', data, vueOptions);
});


module.exports = router;
