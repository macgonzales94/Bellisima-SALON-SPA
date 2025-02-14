// routes/productos.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verificarToken, esAdmin } = require('../middlewares/autenticacion');

// Rutas públicas
router.get('/', productoController.listar);
router.get('/:id', productoController.obtenerPorId);

// Middlewares de parsing
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Rutas protegidas (solo admin)
router.post('/', [verificarToken, esAdmin], productoController.crear);
router.put('/:id', [verificarToken, esAdmin], productoController.actualizar);
router.delete('/:id', [verificarToken, esAdmin], productoController.eliminar);



module.exports = router;