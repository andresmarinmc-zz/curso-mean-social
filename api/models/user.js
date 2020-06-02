"use strict";

var moongose = require("mongoose");
var Schema = moongose.Schema;

var UserSchema = Schema({
  name: String,
  surname: String,
  nick: String,
  email: String,
  password: String,
  role: String,
  image: String,
});

module.exports = moongose.model('User', UserSchema, 'users');