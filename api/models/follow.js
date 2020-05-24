"use strict";

var moongose = require("mongoose");
var Schema = moongose.Schema;

var FollowSchema = Schema({
  user: { type: Schema.ObjectId, ref: 'User' },
  followed: { type: Schema.ObjectId, ref: 'User' }
});

module.exports = moongose.model('Follow', FollowSchema, 'follows');