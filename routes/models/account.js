
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    email: {
        type: String,
        unique: true
    },
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    widget_id: {
        type: Array
    },
});


function isAuthenticated(req, res, next) {
    if (req.user)
        return next();

    res.redirect('/login');
}

function isAuthenticatedLogin(req, res, next) {
    if (!req.user)
        return next();

    res.redirect('/dashboard');
}

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
module.exports.isAuthenticated = isAuthenticated;
module.exports.isAuthenticatedLogin = isAuthenticatedLogin;