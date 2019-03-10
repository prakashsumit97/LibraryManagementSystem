/**
 * Created by karthick on 31/08/16.
 */


var HttpStatus = require('http-status');
var User = require("../models/User");
var Validation = require("./Validation");
var moment = require('moment');
var crypto = require("crypto");
var key = "supersecretkey";
var nodemailer = require('nodemailer');
var elastic = require("./elastic");


exports.save = function(req, res) { //User save

    User.findOne({ email: new RegExp('^' + req.body.email + '$', 'i') }, function(err, user) {
        if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'unexpected error accessing data' });
            return;
        }
        if (user != null) {
            res.status(HttpStatus.BAD_REQUEST).json({ email: 'Email already exists' });
            return;
        }
        var newUser = new User;
        newUser.userName = req.body.userName;
        newUser.name = req.body.name;
        newUser.email = req.body.email;
        newUser.mobileNumber = req.body.mobileNumber;
        newUser.role = req.body.role;
        newUser.createdOn = moment();
        newUser.updatedOn = moment();

        if (newUser.role == 'ADMIN') {
            var password = generatePassword();
            newUser.password = encrypt(key, password)
        }
        newUser.save(function(saveErr, saveUser) {

            if (saveErr) {
                res.status(HttpStatus.BAD_REQUEST).json(Validation.validatingErrors(saveErr));
                return;
            }

            if (password)
                mailNotification(saveUser, password);
            elastic.saveUser(saveUser);
            res.status(HttpStatus.OK).json(saveUser);
        })
    })
};

exports.list = async function(req, res) { // Gets the List of Users.
    console.log('User list invoked...');

    // User.find({ role: req.params.id }, { password: 0 }, function(err, users) {
    //     if (err) {
    //         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'unexpected error accessing data' });
    //         return;
    //     }
    //     res.status(HttpStatus.OK).json(users);
    // });
    res.send(await elastic.getUsers(req.params.id));
};

exports.fetch = async function(req, res) { // Gets an User matching the Id.

    console.log("Getting User with id : " + req.params.id);
    res.send(await elastic.getParticularUsers(req.params.id));
    // User.findById(req.params.id, { password: 0 }, function(err, user) {
    //     if (err) {
    //         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'unexpected error accessing data' });
    //         return;
    //     }
    //     if (user == null) {
    //         res.status(HttpStatus.NOT_FOUND).json({ error: 'User not found' });
    //         return;
    //     }
    //     res.status(HttpStatus.OK).json(user);
    // });
};

exports.update = function(req, res) { // Updates an User.

    console.log('Updating user with id : ' + req.params.id);

    User.findById(req.params.id, function(err, user) {
        if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'unexpected error accessing data' });
            return;
        }
        if (user == null) {
            res.status(HttpStatus.NOT_FOUND).json({ error: 'User not found' });
            return;
        }
        user.userName = req.body.userName;
        user.name = req.body.name;
        user.email = req.body.email;
        user.mobileNumber = req.body.mobileNumber;
        user.role = req.body.role;
        user.updatedOn = moment();

        user.save(function(updateerr, updateuser) {
            if (updateerr) {
                res.status(HttpStatus.BAD_REQUEST).json(Validation.validatingErrors(updateerr));
                return;
            }
            res.status(HttpStatus.OK).json(updateuser);
        });
    });
};

exports.changeActiveStatus = function(req, res) { // Updates an User.

    User.findById(req.params.id, function(err, user) {
        if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'unexpected error accessing data' });
            return;
        }
        if (user == null) {
            res.status(HttpStatus.NOT_FOUND).json({ error: 'User not found' });
            return;
        }

        if (req.params.status == "active")
            user.active = true;

        if (req.params.status == "inactive")
            user.active = false;

        user.save(function(updateerr, updateuser) {
            if (updateerr) {
                res.status(HttpStatus.BAD_REQUEST).json(Validation.validatingErrors(updateerr));
                return;
            }
            res.status(HttpStatus.OK).json(updateuser);
        });
    });
};

exports.activeList = function(req, res) { // Gets the List of Users.
    console.log('User list invoked...');

    User.find({ role: req.params.id, active: true }, { password: 0 }, function(err, users) {
        if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'unexpected error accessing data' });
            return;
        }
        res.status(HttpStatus.OK).json(users);
    });
};

function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

function encrypt(key, data) {
    var cipher = crypto.createCipher('aes-256-cbc', key);
    var crypted = cipher.update(data, 'utf-8', 'hex');
    crypted += cipher.final('hex');

    return crypted;
}

function mailNotification(user, password) {

    var body = '<h5>Dear /userName/</h5></br><p>Your password is : /password/</p>';
    body = body.replace('/userName/', user.name);
    body = body.replace('/password/', password);
    var transporter = nodemailer.createTransport('smtps://test%40gmail.com:test@smtp.gmail.com');

    var mailOptions = {
        from: 'test@gmail.com',
        to: user.email,
        subject: 'Your Password',
        html: body
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    })


}