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

  if (
    params.name &&
    params.surname &&
    params.nick &&
    params.email &&
    params.password
  ) {
    user.name = params.name;
    user.surname = params.surname;
    user.nick = params.nick;
    user.email = params.email;
    user.role = "ROLE_USER";
    user.imagen = null;

    User.findOne({
      $or: [
        { email: user.email.toLowerCase() },
        { nick: user.nick.toLowerCase() },
      ],
    }).countDocuments().exec((err, users) => {

      if (err)
        return res.status(500).send({ message: "Error al guardar usuario" });
      if (users) {
        return res.status(200).send({ message: "Ya hay un usuario con ese email o nick" });
      } else {
          
        bcrypt.hash(params.password, null, null, (err, clave_encriptada) => {
          user.password = clave_encriptada;

          user.save((err, userStored) => {
            if (err)
              return res
                .status(500)
                .send({ message: "Error al guardar usuario" });
            userStored
              ? res.status(200).send({ user: userStored })
              : res
                  .status(404)
                  .send({ message: "No se ha registrado el usuario" });
          });
        }); //Fin bcrypt
        
      }//else if if (users && users.length >= 1) 
    });
  } else {
    res.status(200).send({
      message: "Completa todos los datos obligatorios",
    });
  }
}

function saveUserx(req, res) {
  var params = req.body;
  var user = new User();
}

module.exports = {
  home,
  pruebas,
  saveUser,
};
