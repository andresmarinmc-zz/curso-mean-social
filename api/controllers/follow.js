"use strict";

//var path = require("path");
//var fs = require("fs");
var mongoosePaginate = require("mongoose-pagination");

var User = require("../models/user");
var Follow = require("../models/follow");

function saveFollow(req, res) {
	var params = req.body;
	var follow = new Follow();
	follow.user = req.user.sub;
	follow.followed = params.followed;

	follow.save((err, followStored) => {
		if (err) return res.status(500).send({ message: "Error al guardar follow" });
		if (!followStored) return res.status(404).send({ message: "El follow no se ha guardado" });
		return res.status(200).send({ follow: followStored });
	});
}

function deleteFollow(req, res) {
	var userId = req.user.sub;
	var followedId = req.body.followed;
    console.log("userId: "+userId);
    console.log("followedId: "+followedId);
	Follow.find({ "user": userId, "followed": followedId }).deleteOne(err => {
		if (err) return res.status(500).send({ message: "Error al quitar follow" });
		return res.status(200).send({ message: "El follow se ha quitado" });
	});
}

module.exports = {
	saveFollow,
	deleteFollow,
};
