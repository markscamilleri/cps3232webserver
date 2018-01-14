var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var multer = require('multer');
var upload = multer({dest: 'uploads/'});

// var mongoose = require('mongoose');
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

var app = express();
const HTTP_PORT = 3000;
const HTTPS_PORT = 8443;

// HTTPS options
var myCert = fs.readFileSync('./ssl/photos.cert.pem').toString();
var ca = fs.readFileSync('./ssl/ca-chain.cert.pem').toString();
var cert = myCert.concat("\n").concat(ca);

var httpsOptions = {
    key: fs.readFileSync('./ssl/photos.key.pem'),
    cert: cert,
    ca: ca,
    passphrase: "cps3232",
    requestCert: true,
    rejectUnauthorized: false	
};

// Connect to database
// mongoose.connect(configDB.url);

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

// Express-Session Stuff
app.use(session({
    secret: 'thisismysecretPhotos123' ,
    cookie: { maxAge: 2628000000 },
    // store: new (require('express-sessions'))({
    //     storage: 'mongodb',
    //     instance: mongoose, // optional
    //     host: 'localhost', // optional
    //     port: 27017, // optional
    //     db: 'cps3232 ', // optional
    //     collection: 'sessions', // optional
    //     expire: 86400 // optional
    // }),
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// Routes
require('./app/routes.js')(app, passport, fs, upload); // load our routes and pass in our app and fully configured passport

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
  console.log(err.message);
  res.render('error', {status: err.status || 500, statusCode: err.statusCode || 500, message: err.message});
});

// Launch http server
http.createServer(function(req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'].replace(HTTP_PORT,HTTPS_PORT) + req.url });
}).listen(HTTP_PORT);

// Launch https server
https.createServer(httpsOptions, app).listen(HTTPS_PORT, function() {
    console.log('Express HTTPS server listening on port ' + HTTPS_PORT);
});

module.exports = app;
