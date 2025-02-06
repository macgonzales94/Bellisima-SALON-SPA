// models/Producto.js
const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    // Nombre del producto
    nombre: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio'],
        trim: true
    },

    // Marca del producto
    marca: {
        type: String,
        required: [true, 'La marca es obligatoria'],
        trim: true
    },

    // Descripción detallada del producto
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true
    },

    // Precio del producto
    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },

    // Categoría del producto
    categoria: {
        type: String,
        required: [true, 'La categoría es obligatoria'],
        enum: ['Maquillaje', 'Skincare', 'Cabello', 'Uñas', 'Perfumes', 'Accesorios']
    },

    // Subcategoría para organización más específica
    subcategoria: {
        type: String,
        required: false
    },

    // Array de imágenes del producto
    imagenes: [{
        url: String,
        public_id: String // Para Cloudinary
    }],

    // Stock disponible
    stock: {
        type: Number,
        required: [true, 'El stock es obligatorio'],
        min: [0, 'El stock no puede ser negativo']
    },

    // Características específicas del producto
    caracteristicas: [{
        nombre: String,
        valor: String
    }],

    // Estado del producto (activo/inactivo)
    activo: {
        type: Boolean,
        default: true
    },

    // Producto destacado
    destacado: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Índice para búsquedas
productoSchema.index({ nombre: 'text', descripcion: 'text' });

module.exports = mongoose.model('Producto', productoSchema);