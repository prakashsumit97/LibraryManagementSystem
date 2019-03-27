/**
 * Created by karthick on 01/09/16.
 */

var HttpStatus = require('http-status');
var User = require("../models/User");
var Validation = require("./Validation");
var moment = require('moment');
var crypto = require("crypto");
var key = "supersecretkey";

exports.authenticate = function(req, res) { // Authenticate User.
    console.log('password', encrypt(key, req.body.password));
    User.findOne({ email: new RegExp('^' + req.body.email + '$', 'i'), password: encrypt(key, req.body.password), active: true }, function(err, user) {
        if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'unexpected error accessing data' });
            return;
        }
        if (user == null) {
            res.status(HttpStatus.BAD_REQUEST).json({ error: 'User Name & Password doesn\'t Match' });
            return;
        }
        req.session.loggedInUser = user;
        res.status(HttpStatus.OK).json(user);
    });
};

exports.logout = function(req, res) { // LogOut User.

    if (req.session.loggedInUser) {
        req.session.loggedInUser = null;
        res.status(HttpStatus.OK).json({ success: "logout successfully" });
    }

};

exports.getLoggedInUser = function(req, res) { // Get Logged in user details.

    if (req.session.loggedInUser) {
        User.findById(req.session.loggedInUser._id, { password: 0 }).exec(function(err, user) {
            if (err) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'unexpected error accessing data' });
                return;
            }
            if (user == null) {
                res.status(HttpStatus.NOT_FOUND).json({ error: 'User not found' });
                return;
            }
            res.status(HttpStatus.OK).json(req.session.loggedInUser);
        });
    } else {
        res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Session invalid' });
    }
};

function encrypt(key, data) {
    var cipher = crypto.createCipher('aes192', key);
    var crypted = cipher.update(data, 'utf-8', 'hex');
    crypted += cipher.final('hex');
    //decrypt("e07e4ec7e7781e7f700a95d8b6372b7d", key);
    return crypted;
}

function decrypt(text, key) {
    var decipher = crypto.createDecipher('aes192', key)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}