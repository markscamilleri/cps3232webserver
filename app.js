var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');

// Database stuff
var configDB = require('./config/database.js');

// Passport Stuff
var passportConfig = require('./config/passport')(passport); // pass passport for configuration

// HTTPS stuff
var http = require('http');
var https = require('https');
var fs = require('fs');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
const HTTP_PORT = 3000;
const HTTPS_PORT = 8443;

// HTTPS options
var httpsOptions = {
    ket: fs.readFileSync('./ssl/webserver.key.pem'),
    cert: fs.readFileSync('./ssl/webserver.cert.pem'),
    ca: fs.readFileSync('./ssl/ca-chain.cert.pem')
};

// Connect to database
mongoose.connect(configDB.url);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || HTTPS_PORT);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Passport stuff
app.use(session({secret: 'thisismysecret123' }));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// Routes
require('./app/routes.js');
require('./app/routes.js');

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

// Launch http server
http.createServer(app).listen(HTTP_PORT, function (req, res) {
    res.redirect('https://' + req.headers.host + ":" + HTTPS_PORT + req.url);
});

// Launch https server
https.createServer(httpsOptions, app).listen(HTTPS_PORT, function() {
    console.log('Express HTTPS server listening on port ' + HTTPS_PORT);
});

module.exports = app;