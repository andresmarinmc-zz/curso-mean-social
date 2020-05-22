"use strict";

var express = require("express");
var bodyParser = require("body-parser");

var app = express();

// cargar rutas

// middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// cabeceras

// rutas
app.get("/pruebas", (req, res) => {
    res.status(200).send({
        message: 'Acción de prueba en el servidor de Nodejs'
    })
});

// exportar
module.exports = app;
