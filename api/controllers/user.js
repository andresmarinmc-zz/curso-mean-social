"use strict";

var bcrypt = require("bcrypt-nodejs");
var mongoosePaginate = require("mongoose-pagination");
var fs = require("fs");
var path = require("path");

var User = require("../models/user");
var Follow = require("../models/follow");
var jwt = require("../services/jwt");

function home(req, res) {
	res.status(200).send({
		message: "Acción de home en el servidor de Nodejs",
	});
}

function pruebas(req, res) {
	res.status(200).send({
		message: "Acción de prueba en el servidor de Nodejs",
	});
}

function saveUser(req, res) {
	var params = req.body;
	var user = new User();

	if (params.name && params.surname && params.nick && params.email && params.password) {
		user.name = params.name;
		user.surname = params.surname;
		user.nick = params.nick;
		user.email = params.email;
		user.role = "ROLE_USER";
		user.imagen = null;

		User.findOne({
			$or: [{ email: user.email.toLowerCase() }, { nick: user.nick.toLowerCase() }],
		})
			.countDocuments()
			.exec((err, users) => {
				if (err) return res.status(500).send({ message: "Error al guardar usuario" });
				if (users >= 1) {
					return res.status(200).send({ message: "Ya hay un usuario con ese email o nick" });
				} else {
					bcrypt.hash(params.password, null, null, (err, clave_encriptada) => {
						user.password = clave_encriptada;

						user.save((err, userStored) => {
							if (err) return res.status(500).send({ message: "Error al guardar usuario" });
							userStored
								? res.status(200).send({ user: userStored })
								: res.status(404).send({ message: "No se ha registrado el usuario" });
						});
					}); //Fin bcrypt
				} //else if if (users && users.length >= 1)
			});
	} else {
		res.status(200).send({
			message: "Completa todos los datos obligatorios",
		});
	}
}

function loginUser(req, res) {
	var params = req.body;
	var email = params.email;
	var password = params.password;

	User.findOne({ email: email }, (err, usuario_buscado) => {
		if (err) return res.status(500).send({ message: "Error en la petición" });
		if (usuario_buscado) {
			bcrypt.compare(password, usuario_buscado.password, (err, password_iguales) => {
				if (password_iguales) {
					if (params.getToken) {
						return res.status(200).send({
							token: jwt.createToken(usuario_buscado),
						});
					} else {
						usuario_buscado.password = undefined;
						return res.status(200).send({ user: usuario_buscado });
					}
				} else {
					return res.status(404).send({ message: "El usuario no se ha podido identificar" });
				}
			});
		} else {
			return res.status(404).send({ message: "El usuario no se ha podido identificar" });
		}
	});
}

function getUser(req, res) {
	var userId = req.params.id;

	User.findById(userId, (err, usuario_buscado) => {
		if (err) return res.status(500).send({ message: "Error en la petición" });
		if (!usuario_buscado) return res.status(404).send({ message: "El usuario no existe" });

		followThisUser(req.user.sub, userId).then((value) => {
			usuario_buscado.password = undefined;
			return res.status(200).send({
				usuario_buscado,
				following: value.following,
				followed: value.followed
			});
		});

	});
}

async function followThisUser(identity_user_id, user_id) {
	var following = await Follow.findOne({ "user": identity_user_id, "followed": user_id }).then((follow) => {
		return follow;
	}).catch((err) => {
		if (err) return handleError(err);
	});

	var followed = await Follow.findOne({ "user": user_id, "followed": identity_user_id }).then((follow) => {
		return follow;
	}).catch((err) => {
		if (err) return handleError(err);
	});

	return {
		following: following,
		followed: followed
	}
}

function getUsers(req, res) {
	var identity_user_id = req.user.sub;

	var page = req.params.page ? req.params.page : 1;
	var itemsPerPage = 5;

	User.find()
		.sort("_id")
		.paginate(page, itemsPerPage, (err, users, total) => {
			if (err) return res.status(500).send({ message: "Error en la petición" });
			if (!users) return res.status(404).send({ message: "No hay usuarios disponibles" });

			followUserIds(identity_user_id).then((value) => {

				return res.status(200).send({
					users: users,
					users_following: value.following,
					users_follow_me: value.followed,
					total: total,
					pages: Math.ceil(total / itemsPerPage),
				});
			})

		});
}

async function followUserIds(user_id) {
	var following = await Follow.find({ "user": user_id }).select({ '_id': 0, '__v': 0, 'user': 0 }).then((follows) => {
		return follows
	}).catch((err) => {
		if (err) return handleError(err);
	});

	//Procesar following Ids
	var following_clean = [];
	following.forEach((follow) => {
		following_clean.push(follow.followed);
	});

	var followed = await Follow.find({ "followed": user_id }).select({ '_id': 0, '__v': 0, 'followed': 0 }).then((follows) => {
		return follows;
	}).catch((err) => {
		if (err) return handleError(err);
	});

	//Procesar followed Ids
	var followed_clean = [];
	followed.forEach((follow) => {
		followed_clean.push(follow.user);
	});

	return {
		following: following_clean,
		followed: followed_clean,
	}
}

function getCounters(req, res) {
	var userId = req.user.sub;

	if (req.params.id) {
		userId = req.params.id;
	}

	getCountFollow(userId).then((value) => {
		return res.status(200).send(value);
	});

}

async function getCountFollow(user_id) {
	var following = await Follow.count({ "user": user_id }).then((count) => {
		return count;
	}).catch((err) => {
		if (err) return handleError(err);
	});	
	
	var followed = await Follow.count({ "followed": user_id }).then((count) => {
		return count;
	}).catch((err) => {
		if (err) return handleError(err);
	});

	return {
		following: following,
		followed: followed,
	}
}

function updateUser(req, res) {
	var userId = req.params.id;
	var update = req.body;

	delete update.password;

	if (userId != req.user.sub) {
		return res.status(500).send({ message: "No tienes permisos para actualizar este usuario" });
	}

	User.findByIdAndUpdate(userId, update, { new: true }, (err, usuario_actualizado) => {
		if (err) return res.status(500).send({ message: "Error en la petición" });
		if (!usuario_actualizado) return res.status(404).send({ message: "No se ha podido actualizar el usuario" });
		return res.status(200).send({
			user: usuario_actualizado,
		});
	});
}

//Subir Avatar Usuario
function uploadImage(req, res) {
	var userId = req.params.id;

	if (req.files) {
		var file_path = req.files.image.path;
		var file_name = file_path.split("\\")[2];
		var file_ext = file_name.split(".")[1];

		if (userId != req.user.sub) {
			return removeFilesOfUploads(res, file_path, "No tienes permisos para actualizar la imagen de este usuario");
		}

		if (file_ext == "png" || file_ext == "jpg" || file_ext == "jpeg" || file_ext == "gif") {
			User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, usuario_actualizado) => {
				if (err) return res.status(500).send({ message: "Error en la petición" });
				if (!usuario_actualizado) return res.status(404).send({ message: "No se ha podido actualizar el usuario" });

				return res.status(200).send({
					user: usuario_actualizado,
				});
			});
		} else {
			return removeFilesOfUploads(res, file_path, "El tipo de archivo no es válido");
		}
	} else {
		return res.status(200).send({ message: "No se recibió ninguna imagen" });
	}
}

function removeFilesOfUploads(res, file_path, message) {
	fs.unlink(file_path, err => {
		if (err) return res.status(200).send({ message: "Error al eliminar archivo no válido" });
		return res.status(200).send({ message: message });
	});
}

function getImageFile(req, res) {
	var image_file = req.params.imageFile;
	var path_file = "./uploads/users/" + image_file;

	fs.exists(path_file, exists => {
		if (exists) {
			res.sendFile(path.resolve(path_file));
		} else {
			res.status(200).send({ message: "No existe la imagen" });
		}
	});
}

module.exports = {
	home,
	pruebas,
	saveUser,
	loginUser,
	getUser,
	getUsers,
	updateUser,
	uploadImage,
	getImageFile,
	getCounters
};
