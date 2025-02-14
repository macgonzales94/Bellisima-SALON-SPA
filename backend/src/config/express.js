// src/config/express.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');


function configureExpress(app) {

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors(config.cors));
    app.use(morgan('dev'));

    // Linea de archivos estaticos
    app.use(express.static(path.join(__dirname, '../../public')));

    // Rutas de la API con prefijo
    app.use('/api/admin', require('../routes/admin'));
    app.use('/api/usuarios', require('../routes/usuarios'));
    app.use('/api/productos', require('../routes/productos'));
    app.use('/api/categorias', require('../routes/categorias'));
    app.use('/api/pedidos', require('../routes/pedidos'));
    app.use('/api/carrito', require('../routes/carrito'));
    app.use('/api/pagos', require('../routes/pagos'));
    app.use('/api/cliente', require('../routes/cliente'));

    // Ruta catch-all para SPA - después de las rutas de la API
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../public/index.html'));
    });

    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({
            mensaje: 'Error del servidor',
            error: config.server.env === 'development' ? err.message : {}
        });
    });

    return app;
}

module.exports = configureExpress;