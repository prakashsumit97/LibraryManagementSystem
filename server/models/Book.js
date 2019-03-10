/**
 * Created by karthick on 31/08/16.
 */

var mongoose = require('mongoose');
Schema = mongoose.Schema;

var BookSchema = new mongoose.Schema({
    name: {type: String, required:true},
    author: {type: String, required:true},
    availability: {type: Boolean, required: true,default:true},
    active:{type:Boolean, required:true,default:true},
    createdOn:{type:Date, required:true},
    updatedOn:{type:Date, required:true}
});

var Book = mongoose.model('Book', BookSchema);
module.exports = Book;
