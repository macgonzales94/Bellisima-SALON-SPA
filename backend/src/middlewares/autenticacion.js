// middlewares/autenticacion.js

// Importamos las dependencias necesarias
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Middleware para verificar el token JWT
const verificarToken = async (req, res, next) => {
    try {
        // Obtener el token del header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        // Verificar si existe el token
        if (!token) {
            return res.status(401).json({
                mensaje: 'Acceso denegado. Token no proporcionado'
            });
        }

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Buscar el usuario por ID
        const usuario = await Usuario.findById(decoded.id).select('-password');
        
        if (!usuario) {
            return res.status(401).json({
                mensaje: 'Token no válido - usuario no existe'
            });
        }

        // Agregar el usuario a la request
        req.usuario = usuario;
        next();
    } catch (error) {
        res.status(401).json({
            mensaje: 'Token no válido',
            error: error.message
        });
    }
};

// Middleware para verificar rol de administrador
const esAdmin = (req, res, next) => {
    // Verificar si existe usuario (debería existir por el middleware anterior)
    if (!req.usuario) {
        return res.status(500).json({
            mensaje: 'Se requiere verificar el token primero'
        });
    }

    // Verificar el rol
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({
            mensaje: 'Acceso denegado - Se requiere rol de administrador'
        });
    }

    next();
};

const esCliente = (req, res, next) => {
    if (!req.usuario || req.usuario.rol !== 'cliente') {
        return res.status(403).json({
            mensaje: 'Acceso denegado - Se requiere rol de cliente'
        });
    }
    next();
};

module.exports = {
    verificarToken,
    esAdmin,
    esCliente
};