"use strict";

var express = require("express");
var bodyParser = require("body-parser");

var app = express();

// cargar rutas
var user_routes = require("./routes/user");
var follow_routes = require("./routes/follow");

// middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// cabeceras

// rutas
app.use("/api", user_routes);
app.use("/api", follow_routes);

// exportar
module.exports = app;
