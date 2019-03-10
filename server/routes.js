/**
 * Created by karthick on 31/08/16.
 */

var UserController = require("./controllers/UserController");
var BookController = require("./controllers/BookController");
var TransactionController = require("./controllers/TransactionController");
var LoginController = require("./controllers/LoginController");
var elastic = require("./controllers/elastic");
var HttpStatus = require('http-status');



module.exports = function(app) {

    app.all('/', function(req, res) {
        res.sendFile('index.html', { root: './public/pages/' });
    });

    function loginAuth(req, res, next) {
        next();
        // if (!req.session.loggedInUser) {
        //     res.status(HttpStatus.UNAUTHORIZED).json({ unAuthMsg: 'You must login first!' });
        // } else {
        //     req.session.save();
        //     next();
        // }
    }
    //Login Routes
    app.post("/authenticate", LoginController.authenticate);
    app.post("/logout", LoginController.logout);
    app.get("/loggedInUser", LoginController.getLoggedInUser);

    //User Routes
    app.post("/user", loginAuth, UserController.save);
    app.get("/users/:id", loginAuth, UserController.list);
    app.get("/user/:id", loginAuth, UserController.fetch);
    app.put("/user/:id", loginAuth, UserController.update);
    app.put("/user/:id/statusChange/:status", loginAuth, UserController.changeActiveStatus);
    app.get("/users/:id/active", loginAuth, UserController.activeList);

    //Book Routes
    app.post("/book", loginAuth, BookController.save);
    app.get("/books", loginAuth, BookController.list);
    app.get("/book/:id", loginAuth, BookController.fetch);
    app.put("/book/:id", loginAuth, BookController.update);
    app.put("/book/:id/statusChange/:status", loginAuth, BookController.changeActiveStatus);
    app.get("/activeBook", loginAuth, BookController.activeList);


    //Transaction Routes
    app.post("/transaction", loginAuth, TransactionController.save);
    app.get("/transactions", loginAuth, TransactionController.list);
    app.put("/transaction/:id/changeStatus", loginAuth, TransactionController.changeStatus);

    app.get("/elastic", loginAuth, elastic.testElastic);
};