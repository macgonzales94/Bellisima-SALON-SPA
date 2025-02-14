const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, esAdmin } = require('../middlewares/autenticacion');

// Middlewares de parsing
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Rutas públicas
router.post('/login', usuarioController.login);
router.post('/registro', usuarioController.registro);

// Rutas protegidas (admin)
router.get('/', [verificarToken, esAdmin], usuarioController.listarUsuarios);
router.get('/:id', [verificarToken, esAdmin], usuarioController.obtenerPorId);
router.post('/', [verificarToken, esAdmin], usuarioController.crear);
router.put('/:id', [verificarToken, esAdmin], usuarioController.actualizar);
router.patch('/:id/estado', [verificarToken, esAdmin], usuarioController.toggleEstado);

// Rutas de perfil
router.get('/perfil', verificarToken, usuarioController.obtenerPerfil);
router.put('/perfil', verificarToken, usuarioController.actualizarPerfil);

module.exports = router;