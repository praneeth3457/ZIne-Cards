var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
	avatar: {type: String, required: true},
	gender: {type: String, required: true},
	name: {type: String, required: true},
  username: {type: String, required: true, index:{unique: true}},
	email: {type: String, required: true, index:{unique: true}},
	password: {type: String, required: true},
	games: {type: Number, required: true},
	stars: {type: Number, required: true},
	wins: {type: Number, required: true}
});

module.exports =  mongoose.model('User', UserSchema);
