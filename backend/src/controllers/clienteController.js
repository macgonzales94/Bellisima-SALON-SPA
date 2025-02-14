// controllers/clienteController.js
const Usuario = require('../models/Usuario');
const Pedido = require('../models/Pedido');
const jwt = require('jsonwebtoken');

const clienteController = {
    // Obtener dashboard del cliente
    getDashboard: async (req, res) => {
        try {
            const pedidosPendientes = await Pedido.find({
                usuario: req.usuario._id,
                estado: 'pendiente'
            }).sort({ createdAt: -1 });

            const pedidosRecientes = await Pedido.find({
                usuario: req.usuario._id,
                estado: { $ne: 'pendiente' }
            }).limit(5).sort({ createdAt: -1 });

            res.json({
                pedidosPendientes,
                pedidosRecientes
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener dashboard',
                error: error.message
            });
        }
    },

    // Obtener perfil del cliente
    getPerfil: async (req, res) => {
        try {
            const usuario = await Usuario.findById(req.usuario._id)
                .select('-password');
            res.json({ usuario });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener perfil',
                error: error.message
            });
        }
    },

    // Actualizar perfil
    actualizarPerfil: async (req, res) => {
        try {
            const { nombre, telefono, direccion } = req.body;
            const usuario = await Usuario.findByIdAndUpdate(
                req.usuario._id,
                { nombre, telefono, direccion },
                { new: true }
            ).select('-password');

            res.json({
                mensaje: 'Perfil actualizado exitosamente',
                usuario
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al actualizar perfil',
                error: error.message
            });
        }
    },

    // Obtener pedidos del cliente
    getPedidos: async (req, res) => {
        try {
            const pedidos = await Pedido.find({
                usuario: req.usuario._id
            })
            .populate('productos.producto')
            .sort({ createdAt: -1 });

            res.json(pedidos);
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener pedidos',
                error: error.message
            });
        }
    },

    // Obtener detalle de un pedido
    getDetallePedido: async (req, res) => {
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
            res.status(500).json({
                mensaje: 'Error al obtener detalle del pedido',
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
            await pedido.save();

            res.json({
                mensaje: 'Pedido cancelado exitosamente',
                pedido
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al cancelar pedido',
                error: error.message
            });
        }
    }
};

module.exports = clienteController;