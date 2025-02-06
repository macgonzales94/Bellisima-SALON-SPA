// models/Pedido.js
const mongoose = require('mongoose');
const emailService = require('../utils/emailService');

const pedidoSchema = new mongoose.Schema({
    // Usuario que realiza el pedido
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },

    // Productos incluidos en el pedido
    productos: [{
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto',
            required: true
        },
        cantidad: {
            type: Number,
            required: true
        },
        precioUnitario: {
            type: Number,
            required: true
        }
    }],

    // Dirección de envío
    direccionEnvio: {
        calle: String,
        ciudad: String,
        estado: String,
        codigoPostal: String,
        telefono: String
    },

    // Detalles del pago
    pago: {
        estado: {
            type: String,
            enum: ['pendiente', 'completado', 'fallido', 'reembolsado'],
            default: 'pendiente'
        },
        metodoPago: {
            type: String,
            enum: ['culqi', 'yape'],
            required: true
        },
        referencia: String,
        numeroYape: String,
        fecha: Date,
        intentos: [{
            fecha: Date,
            estado: String,
            error: String
        }]
    },

    // Estado del pedido
    estado: {
        type: String,
        enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
        default: 'pendiente'
    },

    // Totales
    subtotal: Number,
    costoEnvio: {
        type: Number,
        default: 0
    },
    total: Number,

    // Número de seguimiento
    numeroSeguimiento: String,

    // Notas adicionales
    notas: String

}, {
    timestamps: true
});

// Método para calcular totales
pedidoSchema.methods.calcularTotales = function() {
    this.subtotal = this.productos.reduce((total, item) => {
        return total + (item.precioUnitario * item.cantidad);
    }, 0);
    this.total = this.subtotal + this.costoEnvio;
};

module.exports = mongoose.model('Pedido', pedidoSchema);