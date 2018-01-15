module.exports = function (app, passport, fs) {
    const https = require('https');
    const printer = require('./print');

    // Home Page
    app.get('/', function (req, res) {
        res.render(('index'));
    });

    // Login Page
    app.get('/login', function (req, res) {
        res.render(('login'), {message: req.flash('loginMessage')});
    });

    // Process the login form
    app.post('/login', passport.authenticate('oauth2'));

    // Photos page
    app.get('/photos', passport.authenticate('oauth2', {failureRedirect: '/login'}), function (req, res) {
        https.request({
            host: '192.168.1.10',
            port: '8443',
            path: '/api/photos',
            method: 'GET'
        }, function (res) {
            var files = '';

            res.on('data', function (chunk) {
                files += chunk;
            });

            res.on('end', function () {
                res.render('photos', {
                    files: files,
                    message: req.flash('uploadMessage'),
                    user: req.user // get the user out of session and pass to template
                });
            }).on('error', function (err) {
                console.log('Error:' + err.message);
            });
        }).end();
    });

    app.get('/print', passport.authenticate('oauth2', {failureRedirect: '/login'}), function (req, res) {
        if (req.query.photo) {
            https.request({
                host: '192.168.1.10',
                port: '8443',
                path: '/api/photo/' + req.query.photo,
                method: 'GET'
            }, function (res) {
                var data = '';

                res.on('data', function (chunk) {
                    data += chunk;
                });

                res.on('end', function () {
                    printer.printFileToPdf(data, res);
                }).on('error', function (err) {
                    console.log('Error:' + err.message);
                });
            }).end();
        } else {
            res.redirect('/');
        }
    });

    // Logout
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}


function arrayOfN(elements, n) {
    var toReturn = [];
    elements.reverse();

    while (elements.length > 0) {
        var row = [];
        for (var j = 0; j < n; j++) {
            if (elements.length === 0)
                break;
            else {
                row.push(elements.pop());
            }
        }
        toReturn.push(row);
    }

    return toReturn;
}

function arrayIncludes(array, toCheck) {
    for (var elem in array) {
        if (elem === toCheck)
            return true;
    }

    return false;
}
