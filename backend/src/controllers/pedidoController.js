// controllers/pedidoController.js
const Pedido = require('../models/Pedido');
const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');
const emailService = require('../utils/emailService');

const pedidoController = {
    
    // controllers/pedidoController.js
    crear: async (req, res) => {
        try {
            // Obtener carrito activo del usuario
            const carrito = await Carrito.findOne({
                usuario: req.usuario._id,
                estado: 'activo'
            }).populate('productos.producto');

            if (!carrito || carrito.productos.length === 0) {
                return res.status(400).json({
                    mensaje: 'Carrito vacío'
                });
            }

            // Verificar stock disponible
            for (let item of carrito.productos) {
                const producto = await Producto.findById(item.producto);
                if (producto.stock < item.cantidad) {
                    return res.status(400).json({
                        mensaje: `Stock insuficiente para ${producto.nombre}`
                    });
                }
            }

            // Crear el pedido
            const pedido = new Pedido({
                usuario: req.usuario._id,
                productos: carrito.productos,
                direccionEnvio: req.body.direccionEnvio,
                pago: req.body.pago
            });

            // Calcular totales
            pedido.calcularTotales();

            // Actualizar stock de productos
            for (let item of pedido.productos) {
                await Producto.findByIdAndUpdate(item.producto, {
                    $inc: { stock: -item.cantidad }
                });
            }

            // Marcar carrito como procesado
            carrito.estado = 'procesando';
            await carrito.save();

            // Guardar pedido
            await pedido.save();

            // Enviar email de confirmación
            try {
                const usuarioData = await Usuario.findById(req.usuario._id);
                await emailService.enviarConfirmacionPedido(pedido, usuarioData);
            } catch (emailError) {
                console.error('Error al enviar email de confirmación:', emailError);
                // No detenemos el proceso si falla el envío del email
            }

            res.status(201).json({
                mensaje: 'Pedido creado exitosamente',
                pedido
            });
        } catch (error) {
            console.error('Error al crear pedido:', error);
            res.status(500).json({
                mensaje: 'Error al crear pedido',
                error: error.message
            });
        }
    },

    // Obtener pedidos del usuario
    listarPedidosUsuario: async (req, res) => {
        try {
            const pedidos = await Pedido.find({ usuario: req.usuario._id })
                .populate('productos.producto')
                .sort({ createdAt: -1 });

            res.json(pedidos);
        } catch (error) {
            console.error('Error al listar pedidos:', error);
            res.status(500).json({
                mensaje: 'Error al listar pedidos',
                error: error.message
            });
        }
    },

    // Obtener un pedido específico
    obtenerPedido: async (req, res) => {
        try {
            const pedido = await Pedido.findOne({
                _id: req.params.id,
                usuario: req.usuario._id
            }).populate('productos.producto');

            if (!pedido) {
                return res.status(404).json({
                    mensaje: 'Pedido no encontrado'
                });
            }

            res.json(pedido);
        } catch (error) {
            console.error('Error al obtener pedido:', error);
            res.status(500).json({
                mensaje: 'Error al obtener pedido',
                error: error.message
            });
        }
    },

    // Cancelar pedido
    cancelarPedido: async (req, res) => {
        try {
            const pedido = await Pedido.findOne({
                _id: req.params.id,
                usuario: req.usuario._id,
                estado: 'pendiente'
            });

            if (!pedido) {
                return res.status(404).json({
                    mensaje: 'Pedido no encontrado o no se puede cancelar'
                });
            }

            pedido.estado = 'cancelado';
            
            // Restaurar stock
            for (let item of pedido.productos) {
                await Producto.findByIdAndUpdate(item.producto, {
                    $inc: { stock: item.cantidad }
                });
            }

            await pedido.save();

            res.json({
                mensaje: 'Pedido cancelado exitosamente',
                pedido
            });
        } catch (error) {
            console.error('Error al cancelar pedido:', error);
            res.status(500).json({
                mensaje: 'Error al cancelar pedido',
                error: error.message
            });
        }
    }
};

module.exports = pedidoController;