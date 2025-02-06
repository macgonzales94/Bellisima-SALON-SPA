// models/Carrito.js
const mongoose = require('mongoose');

const carritoSchema = new mongoose.Schema({
    // Usuario al que pertenece el carrito
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },

    // Array de productos en el carrito
    productos: [{
        // Referencia al producto
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto',
            required: true
        },
        // Cantidad del producto
        cantidad: {
            type: Number,
            required: true,
            min: [1, 'La cantidad mínima es 1']
        },
        // Precio al momento de agregar al carrito
        precioUnitario: {
            type: Number,
            required: true
        }
    }],

    // Total del carrito (se calculará automáticamente)
    total: {
        type: Number,
        default: 0
    },

    // Estado del carrito
    estado: {
        type: String,
        enum: ['activo', 'procesando', 'completado'],
        default: 'activo'
    }
}, {
    timestamps: true
});

// Método para calcular el total del carrito
carritoSchema.methods.calcularTotal = function() {
    this.total = this.productos.reduce((total, item) => {
        return total + (item.precioUnitario * item.cantidad);
    }, 0);
};

module.exports = mongoose.model('Carrito', carritoSchema);