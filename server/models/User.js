/**
 * Created by karthick on 31/08/16.
 */

var mongoose = require('mongoose');
Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
    userName: {type: String, required:true},
    name: {type: String, required:true},
    mobileNumber: {type: Number, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String},
    role:{type:String,enum:['SUPERADMIN','ADMIN','NORMAL'],required:true},
    active:{type:Boolean, required:true,default:true},
    createdOn:{type:Date, required:true},
    updatedOn:{type:Date, required:true}
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
