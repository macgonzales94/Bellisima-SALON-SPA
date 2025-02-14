// models/Pedido.js
const mongoose = require('mongoose');
const emailService = require('../utils/emailService');

const pedidoSchema = new mongoose.Schema({
    codigoPedido: {
        type: String,
        unique: true
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    productos: [{
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto',
            required: true
        },
        cantidad: Number,
        precioUnitario: Number
    }],
    estado: {
        type: String,
        enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
        default: 'pendiente'
    },
    subtotal: Number,
    costoEnvio: { type: Number, default: 0 },
    total: Number
}, { timestamps: true });

// Generar código de pedido único
pedidoSchema.pre('save', async function (next) {
    if (!this.codigoPedido) {
        this.codigoPedido = 'PED-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Pedido', pedidoSchema);