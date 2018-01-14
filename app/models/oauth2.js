var uid = require('uid2');
var mongoose = require('mongoose');

var ApplicationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    oauth_id: { type: Number, unique: true },
    oauth_secret: { type: String, unique: true, default: function() {
            return uid(42);
        }
    },
    domains: [ { type: String } ]
});
var GrantCodeSchema = new mongoose.Schema({
    code: { type: String, unique: true, default: function() {
            return uid(24);
        }
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    scope: [ { type: String } ],
    active: { type: Boolean, default: true }
});
var AccessTokenSchema = new mongoose.Schema({
    token: { type: String, unique: true, default: function() {
            return uid(124);
        }
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    grant: { type: mongoose.Schema.Types.ObjectId, ref: 'GrantCode' },
    scope: [ { type: String }],
    expires: { type: Date, default: function(){
            var today = new Date();
            var length = 60; // Length (in minutes) of our access token
            return new Date(today.getTime() + length*60000);
        } },
    active: { type: Boolean, get: function(value) {
            if (expires < new Date() || !value) {
                return false;
            } else {
                return value;
            }
        }, default: true }
});

var Application = mongoose.model('Application', ApplicationSchema);
var GrantCode = mongoose.model('GrantCode', GrantCodeSchema);
var AccessToken = mongoose.model('AccessToken', AccessTokenSchema);

module.exports = {
    Application: Application,
    GrantCode: GrantCode,
    AccessToken: AccessToken
};