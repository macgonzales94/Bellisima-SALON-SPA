// tests/email.test.js
require('dotenv').config();
const emailService = require('../src/utils/emailService');

async function testEmail() {
    try {
        const usuarioPrueba = {
            nombre: "Usuario Test",
            email: "miiigueliitho94@gmail.com" // El correo donde quieres recibir el test
        };

        console.log('Enviando email de prueba...');
        await emailService.enviarBienvenida(usuarioPrueba);
        console.log('Email enviado exitosamente');
    } catch (error) {
        console.error('Error en la prueba:', error);
    }
}

testEmail();