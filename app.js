var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var http = require('http');
var https = require('https');
var fs = require('fs');

var index = require('./routes/index');
var users = require('./routes/users');


var httpApp = express();
var app = express();


// HTTPS options
var httpsOptions = {
    cert: fs.readFileSync('./ssl/webserver.cert.pem'),
    ca: fs.readFileSync('./ssl/ca-chain.cert.pem')
};

// http redirect
httpApp.set('port', process.env.PORT || 80);
httpApp.get("*", function (req, res, next) {
   res.redirect("https://" + req.headers.host + "/" + req.path);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 443);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

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

http.createServer(httpApp).listen(httpApp.get('port'),
    function () {
        console.log('Express HTTP server listening on port' + httpApp.get('port'))
    });

https.createServer(httpsOptions, app).listen(app.get('port'), function() {
    console.log('Express HTTPS server listening on port ' + app.get('port'));
});
