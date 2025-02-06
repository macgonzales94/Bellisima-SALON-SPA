// controllers/usuarioController.js
const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const emailService = require('../utils/emailService');

// Función para generar el token JWT
const generarToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// Objeto que contendrá todos los métodos del controlador
const usuarioController = {

    // Registro de nuevo usuario
    registro: async (req, res) => {
        try {
            const { nombre, email, password, telefono, direccion } = req.body;

            // Verificar si el usuario ya existe
            const usuarioExistente = await Usuario.findOne({ email });
            if (usuarioExistente) {
                return res.status(400).json({
                    mensaje: 'Ya existe un usuario con este email'
                });
            }

            // Crear nuevo usuario
            const usuario = new Usuario({
                nombre,
                email,
                password,
                telefono,
                direccion: {
                    calle: direccion?.calle || '',
                    numero: direccion?.numero || '',
                    ciudad: direccion?.ciudad || '',
                    distrito: direccion?.distrito || '',
                    codigoPostal: direccion?.codigoPostal || ''
                }
            });

            // Guardar usuario
            await usuario.save();

            // Enviar email de bienvenida
            try {
                await emailService.enviarBienvenida(usuario);
            } catch (emailError) {
                console.error('Error al enviar email de bienvenida:', emailError);
                // No detenemos el proceso si falla el envío del email
            }

            // Generar token
            const token = generarToken(usuario._id);

            res.status(201).json({
                mensaje: 'Usuario creado exitosamente',
                token,
                usuario: {
                    id: usuario._id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol
                }
            });
        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                mensaje: 'Error al registrar usuario',
                error: error.message
            });
        }
    },
    
    // Login de usuario
    login: async (req, res) => {
        try {
            // Extraer email y password del body
            const { email, password } = req.body;

            // Buscar usuario por email
            const usuario = await Usuario.findOne({ email });
            if (!usuario) {
                return res.status(401).json({
                    mensaje: 'Email o contraseña incorrectos'
                });
            }

            // Verificar contraseña
            const passwordCorrecta = await usuario.compararPassword(password);
            if (!passwordCorrecta) {
                return res.status(401).json({
                    mensaje: 'Email o contraseña incorrectos'
                });
            }

            // Generar token
            const token = generarToken(usuario._id);

            // Enviar respuesta
            res.json({
                mensaje: 'Login exitoso',
                token,
                usuario: {
                    id: usuario._id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol
                }
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                mensaje: 'Error al iniciar sesión',
                error: error.message
            });
        }
    },

    obtenerPerfil: async (req, res) => {
        try {
            // El usuario ya está en req gracias al middleware
            const usuario = req.usuario;
            
            res.json({
                usuario: {
                    id: usuario._id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    telefono: usuario.telefono,
                    direccion: usuario.direccion,
                    rol: usuario.rol
                }
            });
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({
                mensaje: 'Error al obtener perfil',
                error: error.message
            });
        }
    },

    // Actualizar perfil de usuario
    actualizarPerfil: async (req, res) => {
        try {
            const { nombre, telefono, direccion } = req.body;
            
            // Buscar y actualizar usuario
            const usuario = await Usuario.findById(req.usuario.id);
            
            if (nombre) usuario.nombre = nombre;
            if (telefono) usuario.telefono = telefono;
            if (direccion) usuario.direccion = direccion;
            
            await usuario.save();

            res.json({
                mensaje: 'Perfil actualizado exitosamente',
                usuario: {
                    id: usuario._id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    telefono: usuario.telefono,
                    direccion: usuario.direccion
                }
            });
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            res.status(500).json({
                mensaje: 'Error al actualizar perfil',
                error: error.message
            });
        }
    },

    // Listar todos los usuarios (solo admin)
    listarUsuarios: async (req, res) => {
        try {
            const usuarios = await Usuario.find()
                .select('-password')
                .sort({ createdAt: -1 });

            res.json({
                cantidad: usuarios.length,
                usuarios
            });
        } catch (error) {
            console.error('Error al listar usuarios:', error);
            res.status(500).json({
                mensaje: 'Error al listar usuarios',
                error: error.message
            });
        }
    }

};

module.exports = usuarioController;