var express = require('express');
var router = express.Router();

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

module.exports = router;
