// controllers/adminController.js
const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Pedido = require('../models/Pedido');
const jwt = require('jsonwebtoken');

const adminController = {
    // Obtener estadísticas generales
    getDashboard: async (req, res) => {
        try {
            // Obtener totales
            const totalUsuarios = await Usuario.countDocuments();
            const totalProductos = await Producto.countDocuments();
            const totalPedidos = await Pedido.countDocuments();

            // Obtener ventas totales
            const ventas = await Pedido.aggregate([
                {
                    $match: {
                        'pago.estado': 'completado'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$total' },
                        cantidad: { $sum: 1 }
                    }
                }
            ]);

            // Ventas por mes (últimos 6 meses)
            const ventasPorMes = await Pedido.aggregate([
                {
                    $match: {
                        'pago.estado': 'completado',
                        createdAt: {
                            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            mes: { $month: '$createdAt' },
                            año: { $year: '$createdAt' }
                        },
                        total: { $sum: '$total' },
                        cantidad: { $sum: 1 }
                    }
                },
                { $sort: { '_id.año': 1, '_id.mes': 1 } }
            ]);

            res.json({
                estadisticas: {
                    usuarios: totalUsuarios,
                    productos: totalProductos,
                    pedidos: totalPedidos,
                    ventasTotales: ventas[0]?.total || 0
                },
                ventasPorMes
            });
        } catch (error) {
            console.error('Error en dashboard:', error);
            res.status(500).json({
                mensaje: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    },

    // Gestión de usuarios
    getUsuarios: async (req, res) => {
        try {
            const { pagina = 1, limite = 10, busqueda = '' } = req.query;
            const skip = (pagina - 1) * limite;

            let query = {};
            if (busqueda) {
                query = {
                    $or: [
                        { nombre: new RegExp(busqueda, 'i') },
                        { email: new RegExp(busqueda, 'i') }
                    ]
                };
            }

            const usuarios = await Usuario
                .find(query)
                .select('-password')
                .skip(skip)
                .limit(parseInt(limite))
                .sort({ createdAt: -1 });

            const total = await Usuario.countDocuments(query);

            res.json({
                usuarios,
                pagina: parseInt(pagina),
                totalPaginas: Math.ceil(total / limite),
                total
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener usuarios',
                error: error.message
            });
        }
    },

    // Gestión de pedidos
    getPedidos: async (req, res) => {
        try {
            const { pagina = 1, limite = 10, estado } = req.query;
            const skip = (pagina - 1) * limite;

            let query = {};
            if (estado) {
                query.estado = estado;
            }

            const pedidos = await Pedido
                .find(query)
                .populate('usuario', 'nombre email')
                .skip(skip)
                .limit(parseInt(limite))
                .sort({ createdAt: -1 });

            const total = await Pedido.countDocuments(query);

            res.json({
                pedidos,
                pagina: parseInt(pagina),
                totalPaginas: Math.ceil(total / limite),
                total
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener pedidos',
                error: error.message
            });
        }
    },

    // Actualizar estado de pedido
    actualizarEstadoPedido: async (req, res) => {
        try {
            const { pedidoId } = req.params;
            const { estado } = req.body;

            const pedido = await Pedido.findByIdAndUpdate(
                pedidoId,
                { estado },
                { new: true }
            ).populate('usuario', 'nombre email');

            if (!pedido) {
                return res.status(404).json({
                    mensaje: 'Pedido no encontrado'
                });
            }

            res.json({
                mensaje: 'Estado actualizado',
                pedido
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al actualizar estado',
                error: error.message
            });
        }
    },

    actualizar: async (req, res) => {
        try {
            const { nombre, email, telefono, rol, activo, password } = req.body;
            const updateData = { nombre, email, telefono, rol, activo };
            
            if (password) {
                updateData.password = password;
            }

            const usuario = await Usuario.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');

            if (!usuario) {
                return res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });
            }

            res.json({
                mensaje: 'Usuario actualizado exitosamente',
                usuario
            });
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({
                mensaje: 'Error al actualizar usuario',
                error: error.message
            });
        }
    },

       
};

module.exports = adminController;