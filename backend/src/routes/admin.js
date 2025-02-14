// routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verificarToken, esAdmin } = require('../middlewares/autenticacion'); 

// Middleware para todas las rutas de admin
router.use(verificarToken);
router.use(esAdmin);

// Rutas del dashboard
router.get('/dashboard', adminController.getDashboard);

// Rutas de usuarios
router.get('/usuarios', adminController.getUsuarios);

// Rutas de pedidos
router.get('/pedidos', adminController.getPedidos);

// Rutas de pedidos
router.get('/pedidos/:id', adminController.getPedidos);

// actualizar pedido
router.patch('/pedidos/:id/estado', adminController.actualizarEstadoPedido);


module.exports = router;