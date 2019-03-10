/**
 * Created by karthick on 31/08/16.
 */

var HttpStatus = require('http-status');
var Transaction = require("../models/Transaction");
var Validation = require("./Validation");
var Book = require("../models/Book");
var moment= require('moment');

exports.save = function(req,res){            //Transaction Save
    var newTransaction = new Transaction;
    newTransaction.user = req.body.user;
    newTransaction.book = req.body.book;
    newTransaction.issueDate = req.body.issueDate;
    newTransaction.dueDate = req.body.dueDate;
    newTransaction.status = "BORROW";
    newTransaction.createdOn = moment();
    newTransaction.updatedOn = moment();

    newTransaction.save(function(saveErr,saveTran){

        if(saveErr){
            res.status(HttpStatus.BAD_REQUEST).json(Validation.validatingErrors(saveErr));
            return;
        }
        
        Book.findById(saveTran.book,function (err, book) {
            if (err) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({error: 'unexpected error accessing data'});
                return;
            }
            if (book != null) {
                book.availability = false;
                book.updatedOn = moment();

                book.save(function (updateerr, updatebook) {
                    if (updateerr) {
                        console.log(updateerr);
                        return;
                    }
                    res.status(HttpStatus.OK).json(saveTran);
                });  
            }
        });
        
    })
};

exports.list = function (req, res) {                // Gets the List of Transaction.
    console.log('Transaction list invoked...');

    Transaction.find().populate('user book').exec(function (err, trans) {
        if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({error: 'unexpected error accessing data'});
            return;
        }
        res.status(HttpStatus.OK).json(trans);
    });
};

exports.changeStatus = function (req, res) {      // Updates an Tranaction.

    Transaction.findById(req.params.id,function (err, tran) {
        if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({error: 'unexpected error accessing data'});
            return;
        }
        if (tran == null) {
            res.status(HttpStatus.NOT_FOUND).json({error: 'Transaction not found'});
            return;
        }

            tran.status = "RETURN";

        tran.save(function (updateerr, updateTran) {
            if (updateerr) {
                res.status(HttpStatus.BAD_REQUEST).json(Validation.validatingErrors(updateerr));
                return;
            }
            Book.findById(updateTran.book,function (err, book) {
                if (err) {
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({error: 'unexpected error accessing data'});
                    return;
                }
                if (book != null) {
                    book.availability = true;
                    book.updatedOn = moment();

                    book.save(function (updateerr, updatebook) {
                        if (updateerr) {
                            console.log(updateerr);
                            return;
                        }
                        res.status(HttpStatus.OK).json(updateTran);
                    });
                }
            });
        });
    });
};
