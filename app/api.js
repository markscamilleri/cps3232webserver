module.exports = function(app, passport, server) {
    var oauth2model = require('./models/oauth2.js');
    var url = require('url');


    // Get's the username if authenticated to do so
    app.get('/api/me', 	passport.authenticate('bearer', { session: false }), function(req, res) {
        res.json(req.user);
    });

    app.get('/auth/start', function(req, res, done){
	var redirectURI = req.query.redirect_uri;
	var appID = parseInt(req.query.client_id);
	oauth2model.Application.findOne({ oauth_id: appID }, function(error, application) {
            if (application) {
                var match = false, uri = url.parse(redirectURI || '');
                for (var i = 0; i < application.domains.length; i++) {
                    if (uri.host === application.domains[i] || (uri.protocol === application.domains[i] && uri.protocol !== 'http' && uri.protocol !== 'https')) {
                        match = true;
                        break;
                    }
                }
                if (match && redirectURI && redirectURI.length > 0) {
                    done(null, application, redirectURI);
                } else {
                    done(new Error("You must supply a redirect_uri that is a domain or url scheme owned by your app."), false);
                }
            } else if (!error) {
                done(new Error("There is no app with the client_id you supplied."), false);
            } else {
                done(error);
            }
        });
    }, function(req, res) {
        var scopeMap = {
            // ... display strings for all scope variables ...
            view_account: 'view your account',
            edit_account: 'view and edit your account'
        };
        res.render('oauth', {
            transaction_id: req.oauth2.transactionID,
            currentURL: req.originalUrl,
            response_type: req.query.response_type,
            errors: req.flash('error'),
            scope: req.oauth2.req.scope,
            application: req.oauth2.client,
            user: req.user,
            map: scopeMap
        });
    });


    app.post('/auth/finish', function(req, res, next)
    {
	    console.log("I am in auth.finish");
        if (req.user) {
            next();
        } else {
            passport.authenticate('local', {
                session: false
            }, function(error, user, info) {
                if (user) {
                    next();
                } else if (!error) {
                    req.flash('error', 'Your email or password was incorrect. Try again.');
                    res.redirect(req.body['auth_url'])
                }
            })(req, res, next);
        }
    }, server.decision(function(req, done) {
        done(null, { scope: req.oauth2.req.scope });
    }));


    app.post('/auth/exchange', function(req, res, next)
    {
	    console.log("In auth/exchange");
        var appID = req.body['client_id'];
        var appSecret = req.body['client_secret'];

        oauth2model.Application.findOne({ oauth_id: appID, oauth_secret: appSecret }, function(error, application) {
            if (application) {
                req.app = application;
                next();
            } else if (!error) {
                error = new Error("There was no application with the Application ID and Secret you provided.");
                next(error);
            } else {
                next(error);
            }
        });
    }, server.token(), server.errorHandler());

};
