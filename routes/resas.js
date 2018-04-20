const express = require('express');
const router = express.Router()

// TODO this file is probably useless

router.get('/', (req, res, next) => {
  res.send({
    'todo': 'todo'
  })
});


module.exports = router;
