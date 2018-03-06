var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressVue = require('express-vue');

var index = require('./routes/index');
var users = require('./routes/users');
var invoices = require('./routes/invoices');
var stats = require('./routes/stats');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// vue engine setup
const vueOptions = {
    rootPath: path.join(__dirname, 'views'),
    layout: {
        start: '<div id="app">',
        end: '</div>'
    },
    vue: {
      head: {
        title: "CIMDN Resa",
        meta: [
          {script: 'https://cdnjs.cloudflare.com/ajax/libs/vue/2.5.13/vue.min.js'},
          {script: 'https://code.getmdl.io/1.3.0/material.min.js'},
          {script: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment.min.js'},
          {script: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/locale/fr.js'},
          {script: '/javascripts/util.js'},
          {style: 'https://code.getmdl.io/1.3.0/material.indigo-pink.min.css'},
          {style: 'https://fonts.googleapis.com/icon?family=Material+Icons'},
          {style: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'},
          {script: 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.min.js'}
        ]
      }
    }
};
const expressVueMiddleware = expressVue.init(vueOptions);
app.use(expressVueMiddleware);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/invoices', invoices);
app.use('/stats', stats);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
