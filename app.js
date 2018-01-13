var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var oauth2orize = require('oauth2orize');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');

// Database stuff
var configDB = require('./config/database.js');

// Passport Stuff
var passportConfig = require('./config/passport')(passport); // pass passport for configuration

var app = express();

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

// Express-Session Stuff
app.use(session({
    secret: 'thisismysecret123' ,
    cookie: { maxAge: 2628000000 },
    store: new (require('express-sessions'))({
        storage: 'mongodb',
        instance: mongoose, // optional
        host: 'localhost', // optional
        port: 27017, // optional
        db: 'cps3232 ', // optional
        collection: 'sessions', // optional
        expire: 86400 // optional
    }),
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// Routes
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./app/api.js')(app, passport, oauth2server); //load api and pass app to it;

require('./app/oauth2Server.js'); // OAuth2 server
require('./https.js')(app); //load https server

module.exports = app;
