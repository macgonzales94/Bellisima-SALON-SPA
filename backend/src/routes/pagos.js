// routes/pagos.js
const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const { verificarToken } = require('../middlewares/autenticacion');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Procesar pago con tarjeta (Culqi)
router.post('/procesar', pagoController.procesarPago);

// Verificar estado del pago
router.get('/verificar/:cargoId', pagoController.verificarPago);

// Procesar pago con Yape
router.post('/yape', pagoController.procesarPagoYape);

module.exports = router;