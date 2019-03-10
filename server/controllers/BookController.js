/**
 * Created by karthick on 31/08/16.
 */


var HttpStatus = require('http-status');
var Book = require("../models/Book");
var Validation = require("./Validation");
var moment = require('moment');


exports.save = function(req, res) { //Book Save
    var newBook = new Book;
    newBook.name = req.body.name;
    newBook.author = req.body.author;
    newBook.createdOn = moment();
    newBook.updatedOn = moment();
    newBook.save(function(saveErr, saveBook) {

        if (saveErr) {
            res.status(HttpStatus.BAD_REQUEST).json(Validation.validatingErrors(saveErr));
            return;
        }
        elastic.saveBook(newBook);
        res.status(HttpStatus.OK).json(saveBook);
    })
};

exports.list = function(req, res) { // Gets the List of Book.
    console.log('Book list invoked...');

    Book.find(function(err, books) {
        if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'unexpected error accessing data' });
            return;
        }
        res.status(HttpStatus.OK).json(books);
    });
};

exports.fetch = function(req, res) { // Gets an Book matching the Id.

    console.log("Getting Book with id : " + req.params.id);

    Book.findById(req.params.id, function(err, book) {
        if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'unexpected error accessing data' });
            return;
        }
        if (book == null) {
            res.status(HttpStatus.NOT_FOUND).json({ error: 'Book not found' });
            return;
        }
        res.status(HttpStatus.OK).json(book);
    });
};

exports.update = function(req, res) { // Updates an Book.

    console.log('Updating Book with id : ' + req.params.id);

    Book.findById(req.params.id, function(err, book) {
        if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'unexpected error accessing data' });
            return;
        }
        if (book == null) {
            res.status(HttpStatus.NOT_FOUND).json({ error: 'Book not found' });
            return;
        }
        book.name = req.body.name;
        book.author = req.body.author;
        book.availability = req.body.availability;
        book.updatedOn = moment();

        book.save(function(updateerr, updatebook) {
            if (updateerr) {
                res.status(HttpStatus.BAD_REQUEST).json(Validation.validatingErrors(updateerr));
                return;
            }
            res.status(HttpStatus.OK).json(updatebook);
        });
    });
};

exports.changeActiveStatus = function(req, res) { // Updates an Book.

    Book.findById(req.params.id, function(err, book) {
        if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'unexpected error accessing data' });
            return;
        }
        if (book == null) {
            res.status(HttpStatus.NOT_FOUND).json({ error: 'Book not found' });
            return;
        }

        if (req.params.status == "active")
            book.active = true;

        if (req.params.status == "inactive")
            book.active = false;

        book.save(function(updateerr, updatebook) {
            if (updateerr) {
                res.status(HttpStatus.BAD_REQUEST).json(Validation.validatingErrors(updateerr));
                return;
            }
            res.status(HttpStatus.OK).json(updatebook);
        });
    });
};

exports.activeList = function(req, res) { // Gets the List of Book.
    console.log('Book list invoked...');

    Book.find({ active: true, availability: true }, function(err, books) {
        if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'unexpected error accessing data' });
            return;
        }
        res.status(HttpStatus.OK).json(books);
    });
};