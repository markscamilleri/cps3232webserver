    var oauth2orize = require('oauth2orize');
    var oauth2model = require('./models/oauth2.js');

    // OAuth2 stuff
    var server = oauth2orize.createServer();

    server.grant(oauth2orize.grant.code({
        scopeSeparator: [' ', ',']
    }, function (application, redirectURI, user, ares, done) {
        var grant = new oauth2model.GrantCode({
            application: application,
            user: user,
            scope: ares.scope
        });
        grant.save(function (error) {
            done(error, error ? null : grant.code);
        });
    }));

    server.exchange(oauth2orize.exchange.code({
        userProperty: 'app'
    }, function (application, code, redirectURI, done) {
        oauth2model.GrantCode.findOne({code: code}, function (error, grant) {
            if (grant && grant.active && grant.application == application.id) {
                var token = new AccessToken({
                    application: grant.application,
                    user: grant.user,
                    grant: grant,
                    scope: grant.scope
                });
                token.save(function (error) {
                    done(error, error ? null : token.token, null, error ? null : {token_type: 'standard'});
                });
            } else {
                done(error, false);
            }
        });
    }));

    server.serializeClient(function (application, done) {
        done(null, application.id);
    });

    server.deserializeClient(function (id, done) {
        oauth2model.Application.findById(id, function (error, application) {
            done(error, error ? null : application);
        });
    });

    module.exports = server;
