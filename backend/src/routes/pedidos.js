// routes/pedidos.js
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const { verificarToken } = require('../middlewares/autenticacion');

// Todas las rutas requieren autenticación
router.use(verificarToken);

//
router.post('/crear-desde-carrito', pedidoController.crearDesdeCarrito);

// Crear nuevo pedido
router.post('/', pedidoController.crear);

// Obtener pedidos del usuario
router.get('/', pedidoController.listarPedidosUsuario);

// Obtener un pedido específico
router.get('/:id', pedidoController.obtenerPedido);

// Cancelar pedido
router.put('/:id/cancelar', pedidoController.cancelarPedido);

module.exports = router;