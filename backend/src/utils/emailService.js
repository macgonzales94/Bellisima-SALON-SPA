const nodemailer = require('nodemailer');

// Crear el transportador de correo
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Especificamos que usamos Gmail
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para puerto 465, false para otros puertos
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Solo para desarrollo
    }
});

// Verificar la conexión
transporter.verify(function(error, success) {
    if (error) {
        console.log('Error con el servidor de correo:', error);
    } else {
        console.log('Servidor de correo listo');
    }
});

const emailService = {
    // Enviar correo de bienvenida
    enviarBienvenida: async (usuario) => {
        try {
            await transporter.sendMail({
                from: '"Bellisima Salon & Spa" <noreply@bellisima.com>',
                to: usuario.email,
                subject: "¡Bienvenido/a a Bellisima Salon & Spa!",
                html: `
                    <h1>¡Bienvenido/a ${usuario.nombre}!</h1>
                    <p>Gracias por registrarte en Bellisima Salon & Spa.</p>
                    <p>Ahora podrás acceder a todos nuestros productos y servicios.</p>
                `
            });
            console.log('Email de bienvenida enviado');
        } catch (error) {
            console.error('Error al enviar email de bienvenida:', error);
        }
    },

    // Enviar confirmación de pedido
    enviarConfirmacionPedido: async (pedido, usuario) => {
        try {
            await transporter.sendMail({
                from: '"Bellisima Salon & Spa" <noreply@bellisima.com>',
                to: usuario.email,
                subject: `Confirmación de Pedido #${pedido._id}`,
                html: `
                    <h1>¡Gracias por tu pedido!</h1>
                    <p>Tu pedido ha sido confirmado y está siendo procesado.</p>
                    <h2>Detalles del pedido:</h2>
                    <ul>
                        ${pedido.productos.map(item => `
                            <li>${item.producto.nombre} x ${item.cantidad}</li>
                        `).join('')}
                    </ul>
                    <p>Total: S/. ${pedido.total}</p>
                `
            });
            console.log('Email de confirmación de pedido enviado');
        } catch (error) {
            console.error('Error al enviar confirmación de pedido:', error);
        }
    },

    // Enviar actualización de estado de pedido
    enviarActualizacionEstado: async (pedido, usuario) => {
        try {
            await transporter.sendMail({
                from: '"Bellisima Salon & Spa" <noreply@bellisima.com>',
                to: usuario.email,
                subject: `Actualización de Pedido #${pedido._id}`,
                html: `
                    <h1>¡Tu pedido ha sido actualizado!</h1>
                    <p>El estado de tu pedido ha cambiado a: ${pedido.estado}</p>
                    <p>Número de seguimiento: ${pedido.numeroSeguimiento || 'Pendiente'}</p>
                `
            });
            console.log('Email de actualización enviado');
        } catch (error) {
            console.error('Error al enviar actualización:', error);
        }
    },

    // Enviar recordatorio de carrito abandonado
    enviarRecordatorioCarrito: async (usuario, carrito) => {
        try {
            await transporter.sendMail({
                from: '"Bellisima Salon & Spa" <noreply@bellisima.com>',
                to: usuario.email,
                subject: "¡No olvides tus productos!",
                html: `
                    <h1>¡Hola ${usuario.nombre}!</h1>
                    <p>Notamos que dejaste algunos productos en tu carrito.</p>
                    <p>¡Regresa y completa tu compra!</p>
                `
            });
            console.log('Email de recordatorio enviado');
        } catch (error) {
            console.error('Error al enviar recordatorio:', error);
        }
    }
};

module.exports = emailService;