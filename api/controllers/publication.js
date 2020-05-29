"use strict";

var path = require("path");
var fs = require("fs");
var moment = require("moment");
var mongoosePaginate = require("mongoose-pagination");

var Publication = require("../models/publication");
var User = require("../models/user");
var Follow = require("../models/follow");

function savePublication(req, res) {
    var params = req.body;

    if (!params.text) return res.status(200).send({ message: "Debes enviar un texto" });

    var publication = new Publication();
    publication.text = params.text;
    publication.file = null;
    publication.user = req.user.sub;
    publication.created_at = moment().unix();

    publication.save((err, publicacionGuardada) => {
        if (err) return res.status(500).send({ message: "Error al guardar la publicación" });
        if (!publicacionGuardada) return res.status(404).send({ message: "La publicación no se pudo guardar" });
        return res.status(200).send({ publication: publicacionGuardada });
    });

}

function getPublications(req, res) {
    var page = (req.params.page) ? req.params.page : 1;
    var itemsPerPage = 4;

    Follow.find({ user: req.user.sub }).populate('followed').exec((err, follows) => {
        if (err) return res.status(500).send({ message: "Error al obtener followings" });

        var follows_clean = [];

        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });

        Publication.find({ user: { "$in": follows_clean } }).sort("-created_at").populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
            if (err) return res.status(500).send({ message: "Error al listar publicaciones" });
            if (!publications) return res.status(404).send({ message: "No hay publicaciones hechas por los usuarios que sigues" });
            return res.status(200).send({
                total_items: total,
                pages: Math.ceil(total / itemsPerPage),
                page: page,
                publications
            });
        });

    });

}

function getPublication(req, res) {
    var publicationId = req.params.id;

    Publication.find({ "_id": publicationId }, (err, publication) => {
        if (err) return res.status(500).send({ message: "Error al obtener publicación" });
        if (!publication) return res.status(404).send({ message: "No existe la publicación" });
        return res.status(200).send({ publication });
    })
}

function deletePublication(req, res) {
    var publicationId = req.params.id;

    Publication.find({ "user": req.user.sub, "_id": publicationId }).remove(err => {
        if (err) return res.status(500).send({ message: "Error al eliminar publicación" });
        return res.status(200).send({ message: "Publicación eliminada correctamente" });
    })
}

//Subir Avatar Usuario
function uploadImage(req, res) {
    var publicationId = req.params.id;

    if (req.files) {
        var file_path = req.files.image.path;
        var file_name = file_path.split("\\")[2];
        var file_ext = file_name.split(".")[1];

        if (file_ext == "png" || file_ext == "jpg" || file_ext == "jpeg" || file_ext == "gif") {

            Publication.findOne({ "user": req.user.sub, "_id": publicationId }).exec((err, publication) => {
                console.log(publication);
                if (publication) {
                    Publication.findByIdAndUpdate(publicationId, { file: file_name }, { new: true }, (err, publicacion_actualizada) => {
                        if (err) return res.status(500).send({ message: "Error en la petición" });
                        if (!publicacion_actualizada) return res.status(404).send({ message: "No se ha podido actualizar la publicación" });

                        return res.status(200).send({
                            publication: publicacion_actualizada,
                        });
                    });
                }else{
                    return removeFilesOfUploads(res, file_path, "No tienes permisos para actualizar esta publicación");
                }
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
    var path_file = "./uploads/publications/" + image_file;

    fs.exists(path_file, exists => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: "No existe la imagen" });
        }
    });
}

module.exports = {
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
};
