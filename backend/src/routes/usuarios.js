// routes/usuarios.js

const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, esAdmin } = require('../middlewares/autenticacion');

// Ruta de registro - pública
router.post('/registro', usuarioController.registro);

// Ruta de login - pública
router.post('/login', usuarioController.login);

// Ruta para obtener perfil - protegida
router.get('/perfil', verificarToken, usuarioController.obtenerPerfil);

// Ruta para actualizar perfil - protegida
router.put('/perfil', verificarToken, usuarioController.actualizarPerfil);

// Ruta para listar todos los usuarios - solo admin
router.get('/', [verificarToken, esAdmin], usuarioController.listarUsuarios);

module.exports = router;