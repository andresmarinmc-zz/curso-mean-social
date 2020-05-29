"use strict";

var moment = require("moment");
var mongoosePaginate = require("mongoose-pagination");

var User = require("../models/user");
var Follow = require("../models/follow");
var Message = require("../models/message");

function saveFollow(req, res) {
    var params = req.body;

    if (!params.text || !params.receiver) return res.status(200).send({ message: "Completa los campos necesarios" });

    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = 'false';

    message.save((err, messageStored) => {
        if (err) return res.status(500).send({ message: "Error en la petición" });
        if (!messageStored) return res.status(404).send({ message: "Error al enviar el mensaje" });
        return res.status(200).send({ message: messageStored });

    })

}

function getReceivedMessages(req, res) {
    var userId = req.user.sub;
    var page = (req.params.page) ? req.params.page : 1;
    var itemsPerPage = 4;

    Message.find({ receiver: userId }).populate('emitter', 'name surname image nick _id').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({ message: "Error en la petición" });
        if (!messages) return res.status(404).send({ message: "No tienes mensajes" });
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemsPerPage),
            message: messages
        });
    });
}

function getEmmitMessages(req, res) {
    var userId = req.user.sub;
    var page = (req.params.page) ? req.params.page : 1;
    var itemsPerPage = 4;

    Message.find({ emitter: userId }).populate('emitter receiver', 'name surname image nick _id').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({ message: "Error en la petición" });
        if (!messages) return res.status(404).send({ message: "No tienes mensajes" });
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemsPerPage),
            message: messages
        });
    });
}

function getUnviewedMessages(req, res) {
    var userId = req.user.sub;

    Message.count({ receiver: userId, viewed: 'false' }).exec((err, count) => {
        if (err) return res.status(500).send({ message: "Error en la petición" });
        return res.status(200).send({
            'unviewed': count
        })
    });

    // Message.count({ receiver: userId, viewed: 'false' }).then((count) => {
    // 	res.status(200).send({
    //         unviewed: count
    //     });
    // }).catch((err) => {
    // 	if (err) return res.status(500).send({ message: "Error en la petición" });
    // });
}

function setViewedMessages(req, res) {
    var userId = req.user.sub;

    Message.update({ receiver: userId, viewed: 'false' }, { viewed: 'true' }, { "multi": true }, (err, messageUpdate) => {
        if (err) return res.status(500).send({ message: "Error en la petición" });
        return res.status(200).send({
            messages: messageUpdate
        });
    });
}

module.exports = {
    saveFollow,
    getReceivedMessages,
    getEmmitMessages,
    getUnviewedMessages,
    setViewedMessages
};
