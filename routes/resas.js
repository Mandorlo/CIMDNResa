const express = require('express');
const router = express.Router()
const stats = require('../services/stats/stats.js')

router.get('/', (req, res, next) => {
  res.send({'todo': 'todo'})
});

module.exports = router;
