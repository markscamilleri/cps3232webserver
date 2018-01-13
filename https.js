module.exports = function (app) {
    // HTTPS stuff
    var http = require('http');
    var https = require('https');
    var fs = require('fs');

    const HTTP_PORT = 3000;
    const HTTPS_PORT = 8443;

    // HTTPS options
    var myCert = fs.readFileSync('./ssl/sso.cert.pem').toString();
    var ca = fs.readFileSync('./ssl/ca-chain.cert.pem').toString();
    var cert = myCert.concat("\n").concat(ca);

    var httpsOptions = {
        key: fs.readFileSync('./ssl/sso.key.pem'),
        //    cert: fs.readFileSync('./ssl/sso.cert.pem'),
        cert: cert,
        ca: ca,
        passphrase: "cps3232",
        requestCert: true,
        rejectUnauthorized: false
    };

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        console.log(err.message);
        res.render('error', {status: err.status || 500, statusCode: err.statusCode || 500, message: err.message});
    });

    // Launch http server
    http.createServer(function (req, res) {
        res.writeHead(301, {"Location": "https://" + req.headers['host'].replace(HTTP_PORT, HTTPS_PORT) + req.url});
    }).listen(HTTP_PORT);

    // Launch https server
    https.createServer(httpsOptions, app).listen(HTTPS_PORT, function () {
        console.log('Express HTTPS server listening on port ' + HTTPS_PORT);
    });
};