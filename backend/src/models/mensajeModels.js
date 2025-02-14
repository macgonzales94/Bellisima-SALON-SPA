// src/models/Mensaje.js
const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    contenido: {
        type: String,
        required: true
    },
    sala: {
        type: String,
        required: true
    },
    leido: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Mensaje', mensajeSchema);



