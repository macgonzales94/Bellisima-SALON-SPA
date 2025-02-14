// src/config/routes.js
const adminRoutes = require('../routes/admin');
const usuariosRoutes = require('../routes/usuarios');
const productosRoutes = require('../routes/productos');
const categoriasRoutes = require('../routes/categorias');
const pedidosRoutes = require('../routes/pedidos');
const carritoRoutes = require('../routes/carrito');
const pagosRoutes = require('../routes/pagos');
const clienteRoutes = require('../routes/cliente');
const chatRoutes = require('../routes/chatRoutes');

function configureRoutes(app) {
    // Configuración de rutas
    app.use('/api/admin', adminRoutes);
    app.use('/api/usuarios', usuariosRoutes);
    app.use('/api/productos', productosRoutes);
    app.use('/api/categorias', categoriasRoutes);
    app.use('/api/pedidos', pedidosRoutes);
    app.use('/api/carrito', carritoRoutes);
    app.use('/api/pagos', pagosRoutes);
    app.use('/api/cliente', clienteRoutes);
    app.use('/api/chat', chatRoutes);

    return app;
}

module.exports = configureRoutes;