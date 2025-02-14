// models/Cupon.js
const mongoose = require('mongoose');

const cuponSchema = new mongoose.Schema({
    codigo: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    tipo: {
        type: String,
        enum: ['porcentaje', 'monto_fijo'],
        required: true
    },
    valor: {
        type: Number,
        required: true
    },
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaFin: {
        type: Date,
        required: true
    },
    usoMaximo: {
        type: Number,
        default: null
    },
    usosActuales: {
        type: Number,
        default: 0
    },
    minimoCompra: {
        type: Number,
        default: 0
    },
    activo: {
        type: Boolean,
        default: true
    },
    categorias: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Cupon', cuponSchema);