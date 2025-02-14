// routes/carrito.js
const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');
const { verificarToken } = require('../middlewares/autenticacion');

// Todas las rutas del carrito requieren autenticación
router.use(verificarToken);

// Ruta para sincronizar el carrito temporal
router.post('/sincronizar', carritoController.sincronizar);

// Obtener carrito del usuario
router.get('/', carritoController.obtenerCarrito);

// Agregar producto al carrito
router.post('/agregar', carritoController.agregarProducto);

// Actualizar cantidad de un producto
router.put('/actualizar', carritoController.actualizarCantidad);

// Eliminar producto del carrito
router.delete('/eliminar/:productoId', carritoController.eliminarProducto);



module.exports = router;