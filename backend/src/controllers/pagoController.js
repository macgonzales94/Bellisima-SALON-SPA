// controllers/pagoController.js
const Culqi = require('culqi-node');
const Pedido = require('../models/Pedido');
const Carrito = require('../models/Carrito');
const jwt = require('jsonwebtoken');

// Inicializar Culqi con las llaves
const culqi = new Culqi({
    privateKey: process.env.CULQI_PRIVATE_KEY,
    publicKey: process.env.CULQI_PUBLIC_KEY,
    pciCompliant: true,
    apiVersion: "v2"
});

const pagoController = {
    // Método para obtener la llave pública que usaremos en el frontend
    obtenerConfig: async (req, res) => {
        try {
            res.json({
                publicKey: process.env.CULQI_PUBLIC_KEY
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener configuración',
                error: error.message
            });
        }
    },

    // Método para generar el token de la tarjeta
    generarToken: async (req, res) => {
        try {
            // Obtener los datos de la tarjeta del request
            const { card_number, cvv, expiration_month, expiration_year, email } = req.body;

            // Hacer la petición a Culqi para generar el token
            const response = await fetch('https://secure.culqi.com/v2/tokens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.CULQI_PUBLIC_KEY}`
                },
                body: JSON.stringify({
                    card_number,
                    cvv,
                    expiration_month,
                    expiration_year,
                    email
                })
            });

            // Obtener la respuesta
            const data = await response.json();

            // Si hay error en la respuesta, lanzar error
            if (!response.ok) {
                return res.status(400).json({
                    mensaje: 'Error al generar token',
                    error: data.user_message || data.merchant_message
                });
            }

            // Devolver el token generado
            res.json({
                token: data.id
            });

        } catch (error) {
            console.error('Error al generar token:', error);
            res.status(500).json({
                mensaje: 'Error al generar token',
                error: error.message
            });
        }
    },

    // Método para procesar el pago con el token generado
    procesarPago: async (req, res) => {
        try {
            // Obtener el token y el ID del pedido del request
            const { token, pedidoId } = req.body;

            // Buscar el pedido en la base de datos y poblarlo con la información del usuario
            const pedido = await Pedido.findById(pedidoId)
                .populate('usuario', 'email');

            // Verificar si existe el pedido
            if (!pedido) {
                return res.status(404).json({
                    mensaje: 'Pedido no encontrado'
                });
            }

            // Crear el cargo en Culqi usando el token
            const cargo = await culqi.charges.create({
                // Convertir el monto a centavos (requerido por Culqi)
                amount: Math.round(pedido.total * 100),
                // Moneda en Soles Peruanos
                currency_code: 'PEN',
                // Email del cliente
                email: pedido.usuario.email,
                // Token generado previamente
                source_id: token,
                // Descripción del cargo
                description: `Pedido #${pedido._id}`,
            });

            // Actualizar el estado del pedido
            pedido.pago = {
                estado: 'completado',
                metodoPago: 'tarjeta',
                referencia: cargo.id,
                fecha: new Date()
            };
            // Guardar los cambios en el pedido
            await pedido.save();

            // Devolver respuesta exitosa
            res.json({
                mensaje: 'Pago procesado exitosamente',
                cargo: cargo.id,
                pedido: pedido._id
            });

        } catch (error) {
            console.error('Error en el pago:', error);
            
            // Manejo específico de errores de tarjeta
            if (error.type === 'card_error') {
                return res.status(400).json({
                    mensaje: 'Error con la tarjeta',
                    error: error.user_message
                });
            }

            // Manejo de otros errores
            res.status(500).json({
                mensaje: 'Error al procesar el pago',
                error: error.message
            });
        }
    },

    // Método para verificar el estado de un pago
    verificarPago: async (req, res) => {
        try {
            // Obtener el ID del cargo de los parámetros
            const { cargoId } = req.params;
            // Consultar el estado del cargo en Culqi
            const cargo = await culqi.charges.get(cargoId);

            // Devolver el estado del cargo
            res.json({
                estado: cargo.outcome.type,
                detalles: cargo.outcome
            });

        } catch (error) {
            console.error('Error al verificar pago:', error);
            res.status(400).json({
                mensaje: 'Error al verificar el pago',
                error: error.message
            });
        }
    }
};

module.exports = pagoController;