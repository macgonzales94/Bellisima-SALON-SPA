// routes/cliente.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verificarToken } = require('../middlewares/autenticacion');

// Middleware para verificar que es un cliente
const esCliente = (req, res, next) => {
    if (req.usuario.rol !== 'cliente') {
        return res.status(403).json({
            mensaje: 'Acceso denegado'
        });
    }
    next();
};

// Aplicar middleware de autenticación y rol a todas las rutas
router.use(verificarToken, esCliente);

// Dashboard
router.get('/dashboard', clienteController.getDashboard);

// Perfil
router.get('/perfil', clienteController.getPerfil);
router.put('/perfil', clienteController.actualizarPerfil);

// Pedidos
router.get('/pedidos', clienteController.getPedidos);
router.get('/pedidos/:id', clienteController.getDetallePedido);
router.put('/pedidos/:id/cancelar', clienteController.cancelarPedido);

module.exports = router;