"use strict";

var mongoose = require("mongoose");
var app = require("./app");
var port = 3800;

mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost:27017/curso_mean_social", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("curso-mean-social conectado a MongoDB!!");

    //Crear Servidor
    app.listen(port, () => {
        console.log("Servidor Express escuchando en http://localhost:3800");
    });
  })
  .catch((err) => console.log(err));
