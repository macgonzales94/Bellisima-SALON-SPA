// src/config/config.js
require('dotenv').config();

const config = {
    server: {
        port: process.env.PORT || 3000, // Cambiado a 3000 para evitar conflicto con el frontend
        env: process.env.NODE_ENV || 'development'
    },
    
    cors: {
        origin: ['http://127.0.0.1:5501', 'http://localhost:5501'], // Permitir ambos orígenes
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },
    
    
    // Configuración de JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'tu_clave_secreta_por_defecto',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    
    // Otras configuraciones
    api: {
        prefix: '/api'
    }
};

module.exports = config;