// config/passport.js

// load all the things we need
var passportOAuth2 = require('passport-oauth2');

// load up the user model
var User = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use(new passportOAuth2.Strategy({
	    authorizationURL: 'https://192.168.1.12:8443/auth/start',
        tokenURL: 'https://192.168.1.12:8443/auth/exchange',
        clientID: 'CPS3232_Photo_App',
        clientSecret: 'CPS3232_Photo_App_Secret',
        callbackURL: 'https://192.168.1.10:8443/photos'
    }, function(accessToken, refreshToken, profile, callBack){
        User.findOrCreate({ exampleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }));
};


