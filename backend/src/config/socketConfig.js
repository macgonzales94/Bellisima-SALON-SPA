// src/config/socketConfig.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./config');

function configureSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: config.cors.origin,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Nuevo cliente conectado:', socket.id);
        
        // Verificar si hay token de autenticación
        const token = socket.handshake.auth.token;
        let isAuthenticated = false;
        let userName = '';

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                // Verificar si existe nombre en el usuario decodificado
                if (decoded && decoded.nombre) {
                    userName = decoded.nombre;
                    isAuthenticated = true;
                }
            } catch (error) {
                console.log('Token inválido o expirado');
            }
        }

        // Unir al usuario a la sala general
        socket.join('sala_general');

        // Enviar mensaje de bienvenida personalizado
        if (isAuthenticated && userName) {
            socket.emit('mensaje_sistema', {
                mensaje: `¡Hola bienvenido a Bellisima, ${userName}!`,
                isAuthenticated: true,
                userName: userName
            });
        } else {
            socket.emit('mensaje_sistema', {
                mensaje: '¡Hola bienvenido a Bellisima!',
                isAuthenticated: false
            });
        }

        // Manejar mensajes entrantes
        socket.on('enviarMensaje', (data) => {
            const mensaje = {
                contenido: data.contenido,
                usuario: isAuthenticated ? userName : 'Visitante',
                timestamp: new Date(),
                isAuthenticated: isAuthenticated
            };

            // Emitir el mensaje a todos en la sala general
            io.to('sala_general').emit('nuevoMensaje', mensaje);
        });

        // Indicador de escritura
        socket.on('escribiendo', () => {
            socket.broadcast.emit('usuario_escribiendo', {
                usuario: isAuthenticated ? userName : 'Visitante'
            });
        });

        // Manejar desconexiones
        socket.on('disconnect', () => {
            console.log('Cliente desconectado:', isAuthenticated ? userName : 'Visitante');
        });
    });

    return io;
}

module.exports = configureSocket;