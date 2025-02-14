// controllers/carritoController.js
const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');
const jwt = require('jsonwebtoken');

const carritoController = {
    // Obtener el carrito del usuario
    obtenerCarrito: async (req, res) => {
        try {
            // Buscar carrito activo del usuario
            let carrito = await Carrito.findOne({
                usuario: req.usuario._id,
                estado: 'activo'
            }).populate('productos.producto');

            // Si no existe, crear uno nuevo
            if (!carrito) {
                carrito = new Carrito({
                    usuario: req.usuario._id,
                    productos: []
                });
                await carrito.save();
            }

            res.json(carrito);
        } catch (error) {
            console.error('Error al obtener carrito:', error);
            res.status(500).json({
                mensaje: 'Error al obtener carrito',
                error: error.message
            });
        }
    },

    // Agregar producto al carrito
    agregarProducto: async (req, res) => {
        try {
            const { productoId, cantidad } = req.body;

            // Verificar stock del producto
            const producto = await Producto.findById(productoId);
            if (!producto) {
                return res.status(404).json({
                    mensaje: 'Producto no encontrado'
                });
            }

            if (producto.stock < cantidad) {
                return res.status(400).json({
                    mensaje: 'Stock insuficiente'
                });
            }

            // Buscar o crear carrito
            let carrito = await Carrito.findOne({
                usuario: req.usuario._id,
                estado: 'activo'
            });

            if (!carrito) {
                carrito = new Carrito({
                    usuario: req.usuario._id,
                    productos: []
                });
            }

            // Verificar si el producto ya está en el carrito
            const productoExistente = carrito.productos.find(
                item => item.producto.toString() === productoId
            );

            if (productoExistente) {
                productoExistente.cantidad += cantidad;
            } else {
                carrito.productos.push({
                    producto: productoId,
                    cantidad: cantidad,
                    precioUnitario: producto.precio
                });
            }

            // Calcular total
            carrito.calcularTotal();
            await carrito.save();

            res.json({
                mensaje: 'Producto agregado al carrito',
                carrito
            });
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            res.status(500).json({
                mensaje: 'Error al agregar al carrito',
                error: error.message
            });
        }
    },

    // Actualizar cantidad de un producto
    actualizarCantidad: async (req, res) => {
        try {
            const { productoId, cantidad } = req.body;

            const carrito = await Carrito.findOne({
                usuario: req.usuario._id,
                estado: 'activo'
            });

            if (!carrito) {
                return res.status(404).json({
                    mensaje: 'Carrito no encontrado'
                });
            }

            const productoEnCarrito = carrito.productos.find(
                item => item.producto.toString() === productoId
            );

            if (!productoEnCarrito) {
                return res.status(404).json({
                    mensaje: 'Producto no encontrado en el carrito'
                });
            }

            productoEnCarrito.cantidad = cantidad;
            carrito.calcularTotal();
            await carrito.save();

            res.json({
                mensaje: 'Cantidad actualizada',
                carrito
            });
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
            res.status(500).json({
                mensaje: 'Error al actualizar cantidad',
                error: error.message
            });
        }
    },

    // Eliminar producto del carrito
    eliminarProducto: async (req, res) => {
        try {
            const { productoId } = req.params;

            const carrito = await Carrito.findOne({
                usuario: req.usuario._id,
                estado: 'activo'
            });

            if (!carrito) {
                return res.status(404).json({
                    mensaje: 'Carrito no encontrado'
                });
            }

            carrito.productos = carrito.productos.filter(
                item => item.producto.toString() !== productoId
            );

            carrito.calcularTotal();
            await carrito.save();

            res.json({
                mensaje: 'Producto eliminado del carrito',
                carrito
            });
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            res.status(500).json({
                mensaje: 'Error al eliminar producto',
                error: error.message
            });
        }
    },

     // Transferir carrito temporal a usuario autenticado
     transferirCarritoTemp: async (req, res) => {
        try {
            const { productos } = req.body;
            
            // Buscar o crear carrito del usuario
            let carrito = await Carrito.findOne({
                usuario: req.usuario._id,
                estado: 'activo'
            });

            if (!carrito) {
                carrito = new Carrito({
                    usuario: req.usuario._id,
                    productos: []
                });
            }

            // Agregar productos del carrito temporal
            for (const item of productos) {
                const productoExistente = carrito.productos.find(
                    p => p.producto.toString() === item.producto._id
                );

                if (productoExistente) {
                    productoExistente.cantidad += item.cantidad;
                } else {
                    carrito.productos.push({
                        producto: item.producto._id,
                        cantidad: item.cantidad
                    });
                }
            }

            await carrito.save();
            res.json({
                mensaje: 'Carrito transferido exitosamente',
                carrito
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al transferir carrito',
                error: error.message
            });
        }
    },

    sincronizar: async (req, res) => {
        try {
            const { productos } = req.body;
            const usuarioId = req.usuario._id;

            // Buscar o crear el carrito del usuario
            let carrito = await Carrito.findOne({ usuario: usuarioId });
            
            if (!carrito) {
                carrito = new Carrito({
                    usuario: usuarioId,
                    productos: []
                });
            }

            // Validar y agregar cada producto
            for (const item of productos) {
                // Verificar si el producto existe
                const producto = await Producto.findById(item.producto);
                if (!producto) {
                    continue; // Saltar productos que no existen
                }

                // Verificar si el producto ya está en el carrito
                const productoExistente = carrito.productos.find(
                    p => p.producto.toString() === item.producto
                );

                if (productoExistente) {
                    // Actualizar cantidad
                    productoExistente.cantidad += item.cantidad;
                } else {
                    // Agregar nuevo producto
                    carrito.productos.push({
                        producto: item.producto,
                        cantidad: item.cantidad,
                        precioUnitario: producto.precio
                    });
                }
            }

            // Recalcular el total
            carrito.total = carrito.productos.reduce((total, item) => {
                return total + (item.precioUnitario * item.cantidad);
            }, 0);

            // Guardar cambios
            await carrito.save();

            res.json({
                mensaje: 'Carrito sincronizado exitosamente',
                carrito
            });

        } catch (error) {
            console.error('Error al sincronizar carrito:', error);
            res.status(500).json({
                mensaje: 'Error al sincronizar el carrito',
                error: error.message
            });
        }
    }
};

module.exports = carritoController;