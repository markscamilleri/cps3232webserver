// config/passport.js

// load all the things we need
var Strategy = require('passport-http-bearer').Strategy;

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




    passport.use(new Strategy(function(token, done){
        User.findOne({token: token}, function (err, user) {
            if (err) return done(err);
            if (!user) return done(null, false);
            return done(null, user, {scope: 'all'})
        })
    }));

};


