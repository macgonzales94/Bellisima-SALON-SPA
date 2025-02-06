// models/Categoria.js
const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la categoría es obligatorio'],
        trim: true,
        unique: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    activo: {
        type: Boolean,
        default: true
    },
    imagen: {
        url: String,
        public_id: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Categoria', categoriaSchema);