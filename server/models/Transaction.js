/**
 * Created by karthick on 31/08/16.
 */

var mongoose = require('mongoose');
Schema = mongoose.Schema;

var TransactionSchema = new mongoose.Schema({
    user:{type:Schema.Types.ObjectId, ref:'User', required:true},
    book:{type:Schema.Types.ObjectId, ref:'Book', required:true},
    status:{type:String,enum:['BORROW','RETURN'],required:true},
    issueDate:{type:Date, required:true},
    dueDate:{type:Date, required:true},
    createdOn:{type:Date, required:true},
    updatedOn:{type:Date, required:true}
});

var Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;

