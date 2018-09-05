let express = require('express');
let router = express.Router();
const PARAM = require('../services/param/param.js');
let auth = require('../services/auth/auth.js');
let sessionChecker = auth.sessionChecker;

// route for user signup
if (PARAM.admin && PARAM.admin.enable_signup) {
    router.route('/signup')
    .get((req, res) => {
        res.renderVue('pages/login', {formType: "Signup"})
    })
    .post((req, res) => {
        auth.createUser({
            email: req.body.email,
            password: req.body.password
        })
        .then(user => {
            console.log("created user " + user.email)
            req.session.user = user.sessionId;
            req.session.email = user.email;
            res.redirect('/home?welcome=' + user.email);
        })
        .catch(error => {
            console.log("ERROR in User.create : ", error)
            res.redirect('/signup');
        });
    });
}


// route for user Login
router.route('/login')
    .get((req, res) => {
        let data = {enableSignup: true}
        if (PARAM.admin) data.enableSignup = PARAM.admin.enable_signup;
        if (req.query.target) data.target = req.query.target;
        res.renderVue('pages/login', data)
    })
    .post((req, res) => {
        auth.findUser(req.body.email, req.body.password).then(function (user) {
            if (!user) {
                res.redirect('/login');
            } else {
                req.session.user = user.sessionId;
                req.session.email = user.email;

                let redirectUrl = '/home';
                if (req.body.target != '') redirectUrl = '/' + req.body.target;
                res.redirect(redirectUrl + '?welcome=' + user.email);
            }
        }).catch(err => {
            console.log("Error in User.find : ", err)
            //res.redirect('/login')
        })
  });


// route for user logout
router.get('/logout', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
      res.clearCookie('user_sid');
      res.redirect('/home');
  } else {
      res.redirect('/home');
  }
});

module.exports = router;
