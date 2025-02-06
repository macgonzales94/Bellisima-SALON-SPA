// controllers/carritoController.js
const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');

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
    }
};

module.exports = carritoController;