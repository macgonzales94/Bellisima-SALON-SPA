// controllers/pagoController.js
const Culqi = require('culqi-node');
const Pedido = require('../models/Pedido');
const Carrito = require('../models/Carrito');

// Inicializar Culqi con las llaves
const culqi = new Culqi({
    privateKey: process.env.CULQI_PRIVATE_KEY,
    publicKey: process.env.CULQI_PUBLIC_KEY,
    pciCompliant: true,
    apiVersion: "v2"
});

const pagoController = {
    // Generar cargo con Culqi
    procesarPago: async (req, res) => {
        try {
            const { token, pedidoId } = req.body;

            // Obtener el pedido
            const pedido = await Pedido.findById(pedidoId)
                .populate('usuario', 'email');

            if (!pedido) {
                return res.status(404).json({
                    mensaje: 'Pedido no encontrado'
                });
            }

            // Crear el cargo en Culqi
            const cargo = await culqi.charges.create({
                amount: Math.round(pedido.total * 100), // Convertir a centavos
                currency_code: 'PEN',
                email: pedido.usuario.email,
                source_id: token,
                description: `Pedido #${pedido._id}`,
                metadata: {
                    pedido_id: pedido._id.toString(),
                    usuario_id: pedido.usuario._id.toString()
                }
            });

            // Actualizar el estado del pedido
            pedido.pago = {
                estado: 'completado',
                metodoPago: 'culqi',
                referencia: cargo.id,
                fecha: new Date()
            };
            await pedido.save();

            res.json({
                mensaje: 'Pago procesado exitosamente',
                cargo: cargo.id,
                pedido: pedido._id
            });

        } catch (error) {
            console.error('Error en el pago:', error);
            res.status(400).json({
                mensaje: 'Error al procesar el pago',
                error: error.message || 'Error desconocido'
            });
        }
    },

    // Verificar estado del pago
    verificarPago: async (req, res) => {
        try {
            const { cargoId } = req.params;
            const cargo = await culqi.charges.get(cargoId);

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
    },

    // Procesar pago con Yape
    procesarPagoYape: async (req, res) => {
        try {
            const { pedidoId, numeroYape } = req.body;

            const pedido = await Pedido.findById(pedidoId);
            if (!pedido) {
                return res.status(404).json({
                    mensaje: 'Pedido no encontrado'
                });
            }

            // Aquí iría la integración con Yape
            pedido.pago = {
                estado: 'pendiente',
                metodoPago: 'yape',
                referencia: `YAPE-${Date.now()}`,
                numeroYape: numeroYape,
                fecha: new Date()
            };
            await pedido.save();

            res.json({
                mensaje: 'Pago con Yape registrado',
                pedido: pedido._id
            });

        } catch (error) {
            console.error('Error en pago Yape:', error);
            res.status(400).json({
                mensaje: 'Error al procesar pago con Yape',
                error: error.message
            });
        }
    },

    webhook: async (req, res) => {
        try {
            const evento = req.body;
            const signature = req.headers['culqi-signature'];

            // Verificar firma del webhook
            if (!culqi.webhooks.verify(evento, signature)) {
                return res.status(400).send('Firma inválida');
            }

            switch (evento.type) {
                case 'charge.succeeded':
                    // Actualizar pedido cuando el pago es exitoso
                    await Pedido.findOneAndUpdate(
                        { 'pago.referencia': evento.data.id },
                        {
                            $set: {
                                'pago.estado': 'completado',
                                estado: 'procesando'
                            }
                        }
                    );
                    break;

                case 'charge.failed':
                    // Manejar pago fallido
                    await Pedido.findOneAndUpdate(
                        { 'pago.referencia': evento.data.id },
                        {
                            $set: {
                                'pago.estado': 'fallido'
                            }
                        }
                    );
                    break;
            }

            res.json({ received: true });
        } catch (error) {
            console.error('Error en webhook:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = pagoController;