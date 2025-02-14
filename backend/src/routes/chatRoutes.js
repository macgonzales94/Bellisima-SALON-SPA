
// src/routes/chat.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verificarToken } = require('../middlewares/autenticacion');

router.use(verificarToken);

router.get('/historial/:sala', chatController.obtenerHistorial);
router.put('/marcar-leidos/:sala', chatController.marcarLeidos);

module.exports = router;