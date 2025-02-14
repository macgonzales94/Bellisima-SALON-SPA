const express = require('express');
const path = require('path');
const http = require('http');
const config = require('./config/config');
const configureExpress = require('./config/express');
const configureRoutes = require('./config/routes');
const conectarDB = require('./config/database');
const configureSocket = require('./config/socketConfig');

async function iniciarServidor() {
    try {
        // Inicializar app y crear servidor HTTP
        const app = express();
        const server = http.createServer(app);

        // Conectar a la base de datos
        await conectarDB();

        // Configurar express (middlewares y manejo de errores)
        configureExpress(app);

        // Configurar Socket.IO
        const io = configureSocket(server);

        // Hacer io disponible en la app para usarlo en los controladores
        app.set('io', io);

        // Configurar rutas
        configureRoutes(app);

        // Iniciar servidor
        server.listen(config.server.port, () => {
            console.log(`Servidor corriendo en puerto ${config.server.port}`);
            console.log(`Ambiente: ${config.server.env}`);
        });

        // Manejo de errores no capturados
        process.on('unhandledRejection', (err) => {
            console.error('Error no manejado:', err);
            // En producción, podrías querer cerrar el servidor gracefully
            // server.close(() => process.exit(1));
        });

        return app;
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Iniciar el servidor
iniciarServidor();
