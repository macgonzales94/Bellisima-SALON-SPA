// routes/categorias.js
const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const { verificarToken, esAdmin } = require('../middlewares/autenticacion');

// Rutas públicas
router.get('/', categoriaController.listar);
router.get('/:id', categoriaController.obtenerPorId);

// Rutas protegidas (solo admin)
router.post('/', [verificarToken, esAdmin], categoriaController.crear);
router.put('/:id', [verificarToken, esAdmin], categoriaController.actualizar);
router.delete('/:id', [verificarToken, esAdmin], categoriaController.eliminar);

module.exports = router;