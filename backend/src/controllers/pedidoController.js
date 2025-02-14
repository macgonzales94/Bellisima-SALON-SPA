// controllers/pedidoController.js
const Pedido = require('../models/Pedido');
const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');
const emailService = require('../utils/emailService');
const jwt = require('jsonwebtoken');

const pedidoController = {

    // Agregar este nuevo método
    crearDesdeCarrito: async (req, res) => {
        try {
            if (!req.usuario || !req.usuario._id) {
                return res.status(401).json({ mensaje: 'Usuario no autenticado' });
            }

            const usuarioId = req.usuario._id;

            // Verificar si ya hay un pedido en estado "pendiente" para este usuario
            const pedidoExistente = await Pedido.findOne({ usuario: usuarioId, estado: 'pendiente' });
            if (pedidoExistente) {
                return res.status(400).json({ mensaje: 'Ya tienes un pedido en proceso' });
            }

            // Obtener el carrito del usuario
            const carrito = await Carrito.findOne({ usuario: usuarioId, estado: 'activo' })
                .populate('productos.producto');

            if (!carrito || carrito.productos.length === 0) {
                return res.status(400).json({ mensaje: 'Carrito vacío' });
            }

            // Verificar stock
            for (let item of carrito.productos) {
                const producto = await Producto.findById(item.producto._id);
                if (!producto || producto.stock < item.cantidad) {
                    return res.status(400).json({ mensaje: `Stock insuficiente para ${item.producto.nombre}` });
                }
            }

            // Crear un único pedido con código generado automáticamente
            const pedido = new Pedido({
                usuario: usuarioId,
                productos: carrito.productos.map(item => ({
                    producto: item.producto._id,
                    cantidad: item.cantidad,
                    precioUnitario: item.producto.precio
                })),
                estado: 'pendiente',
                pago: { estado: 'pendiente', metodoPago: 'culqi' }
            });

            pedido.calcularTotales(); // Calcular total del pedido
            await pedido.save(); // Guardar pedido en la base de datos

            // Marcar el carrito como procesado
            carrito.estado = 'procesado';
            await carrito.save();

            res.json({
                mensaje: 'Pedido creado exitosamente',
                pedido: {
                    _id: pedido._id,
                    codigoPedido: pedido.codigoPedido, // Enviar código de pedido
                    productos: pedido.productos,
                    subtotal: pedido.subtotal,
                    total: pedido.total
                }
            });

        } catch (error) {
            console.error('Error al crear pedido desde carrito:', error);
            res.status(500).json({ mensaje: 'Error al crear pedido', error: error.message });
        }
    },

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

    // Actualizar pedido (solo admin)
    actualizarPedido: async (req, res) => {
        try {
            // Primero obtenemos el pedido actual
            const pedidoExistente = await Pedido.findById(req.params.id);

            if (!pedidoExistente) {
                return res.status(404).json({
                    mensaje: 'Pedido no encontrado'
                });
            }

            // Preparamos el objeto de actualización
            const actualizacion = {};

            // Actualización de productos
            if (req.body.productos) {
                actualizacion.productos = req.body.productos;
                // Verificar stock para nuevos productos
                for (let item of req.body.productos) {
                    const producto = await Producto.findById(item.producto);
                    if (!producto) {
                        return res.status(400).json({
                            mensaje: `Producto ${item.producto} no encontrado`
                        });
                    }
                    if (producto.stock < item.cantidad) {
                        return res.status(400).json({
                            mensaje: `Stock insuficiente para ${producto.nombre}`
                        });
                    }
                }
            }

            // Actualización de dirección de envío
            if (req.body.direccionEnvio) {
                actualizacion.direccionEnvio = {
                    calle: req.body.direccionEnvio.calle,
                    ciudad: req.body.direccionEnvio.ciudad,
                    estado: req.body.direccionEnvio.estado,
                    codigoPostal: req.body.direccionEnvio.codigoPostal,
                    telefono: req.body.direccionEnvio.telefono
                };
            }

            // Actualización de pago
            if (req.body.pago) {
                actualizacion.pago = {
                    estado: req.body.pago.estado,
                    metodoPago: req.body.pago.metodoPago,
                    referencia: req.body.pago.referencia,
                    numeroYape: req.body.pago.numeroYape,
                    fecha: req.body.pago.fecha,
                    intentos: req.body.pago.intentos
                };
            }

            // Actualización de estado
            if (req.body.estado) {
                actualizacion.estado = req.body.estado;
            }

            // Actualización de costos
            if (req.body.costoEnvio !== undefined) {
                actualizacion.costoEnvio = req.body.costoEnvio;
            }

            // Actualización de número de seguimiento
            if (req.body.numeroSeguimiento) {
                actualizacion.numeroSeguimiento = req.body.numeroSeguimiento;
            }

            // Actualización de notas
            if (req.body.notas) {
                actualizacion.notas = req.body.notas;
            }

            // Realizar la actualización
            const pedidoActualizado = await Pedido.findByIdAndUpdate(
                req.params.id,
                actualizacion,
                {
                    new: true,
                    runValidators: true
                }
            ).populate('productos.producto');

            // Recalcular totales si es necesario
            if (req.body.productos || req.body.costoEnvio !== undefined) {
                pedidoActualizado.calcularTotales();
                await pedidoActualizado.save();
            }

            res.json({
                mensaje: 'Pedido actualizado exitosamente',
                pedido: pedidoActualizado
            });

        } catch (error) {
            console.error('Error al actualizar pedido:', error);
            res.status(500).json({
                mensaje: 'Error al actualizar pedido',
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