"use strict";

var bcrypt = require("bcrypt-nodejs");
var User = require("../models/user");

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
                    usuario_buscado.password = undefined;
					return res.status(200).send({ user: usuario_buscado });
				} else {
					return res.status(404).send({ message: "El usuario no se ha podido identificar" });
				}
			});
		} else {
			return res.status(404).send({ message: "El usuario no se ha podido identificar" });
		}
	});
}

module.exports = {
	home,
	pruebas,
	saveUser,
	loginUser,
};
