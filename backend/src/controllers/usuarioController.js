const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

const usuarioController = {
    // Registro de usuario
    registro: async (req, res) => {
        try {
            const { nombre, email, password, telefono, rol } = req.body;

            // Verificar si el usuario ya existe
            const usuarioExistente = await Usuario.findOne({ email });
            if (usuarioExistente) {
                return res.status(400).json({
                    mensaje: 'Ya existe un usuario con este correo electrónico'
                });
            }

            // Crear nuevo usuario
            const nuevoUsuario = new Usuario({
                nombre,
                email,
                password,
                telefono,
                rol: rol || 'cliente'
            });

            // Guardar usuario
            await nuevoUsuario.save();

            // Generar token
            const token = jwt.sign(
                { id: nuevoUsuario._id, rol: nuevoUsuario.rol },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.status(201).json({
                mensaje: 'Usuario registrado exitosamente',
                token,
                usuario: {
                    id: nuevoUsuario._id,
                    nombre: nuevoUsuario.nombre,
                    email: nuevoUsuario.email,
                    rol: nuevoUsuario.rol
                }
            });
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            res.status(500).json({
                mensaje: 'Error al registrar usuario',
                error: error.message
            });
        }
    },

    // Login de usuario
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Buscar usuario
            const usuario = await Usuario.findOne({ email });
            if (!usuario) {
                return res.status(400).json({
                    mensaje: 'Credenciales inválidas'
                });
            }

            // Verificar contraseña
            const esPasswordValido = await usuario.compararPassword(password);
            if (!esPasswordValido) {
                return res.status(400).json({
                    mensaje: 'Credenciales inválidas'
                });
            }

            // Generar token
            const token = jwt.sign(
                { id: usuario._id, rol: usuario.rol },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.json({
                mensaje: 'Inicio de sesión exitoso',
                token,
                usuario: {
                    id: usuario._id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol
                }
            });
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            res.status(500).json({
                mensaje: 'Error al iniciar sesión',
                error: error.message
            });
        }
    },

    // Listar usuarios (solo para admin)
    listarUsuarios: async (req, res) => {
        try {
            const { pagina = 1, limite = 10, busqueda = '' } = req.query;
            
            // Construir query
            let query = {};
            
            // Búsqueda por nombre o email
            if (busqueda) {
                query.$or = [
                    { nombre: { $regex: busqueda, $options: 'i' } },
                    { email: { $regex: busqueda, $options: 'i' } }
                ];
            }

            // Calcular skip para paginación
            const skip = (pagina - 1) * limite;

            // Obtener usuarios
            const usuarios = await Usuario.find(query)
                .select('-password')
                .skip(skip)
                .limit(parseInt(limite));

            // Contar total de usuarios
            const total = await Usuario.countDocuments(query);

            res.json({
                total,
                totalPaginas: Math.ceil(total / limite),
                paginaActual: parseInt(pagina),
                usuarios
            });
        } catch (error) {
            console.error('Error al listar usuarios:', error);
            res.status(500).json({
                mensaje: 'Error al listar usuarios',
                error: error.message
            });
        }
    },

    // Obtener usuario por ID
    obtenerPorId: async (req, res) => {
        try {
            const usuario = await Usuario.findById(req.params.id).select('-password');
            
            if (!usuario) {
                return res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });
            }

            res.json(usuario);
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            res.status(500).json({
                mensaje: 'Error al obtener usuario',
                error: error.message
            });
        }
    },

    // Obtener perfil de usuario
    obtenerPerfil: async (req, res) => {
        try {
            const usuario = await Usuario.findById(req.usuario.id).select('-password');
            
            if (!usuario) {
                return res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });
            }

            res.json(usuario);
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({
                mensaje: 'Error al obtener perfil',
                error: error.message
            });
        }
    },

    // Crear usuario (desde admin)
    crear: async (req, res) => {
        try {
            const { nombre, email, password, telefono, rol, activo } = req.body;

            const usuarioExistente = await Usuario.findOne({ email });
            if (usuarioExistente) {
                return res.status(400).json({
                    mensaje: 'Ya existe un usuario con este correo electrónico'
                });
            }

            const usuario = new Usuario({
                nombre,
                email,
                password,
                telefono,
                rol,
                activo
            });

            await usuario.save();

            res.status(201).json({
                mensaje: 'Usuario creado exitosamente',
                usuario: {
                    id: usuario._id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol,
                    activo: usuario.activo
                }
            });
        } catch (error) {
            console.error('Error al crear usuario:', error);
            res.status(500).json({
                mensaje: 'Error al crear usuario',
                error: error.message
            });
        }
    },

    // Actualizar perfil
    actualizarPerfil: async (req, res) => {
        try {
            const { nombre, telefono, direccion } = req.body;

            const usuario = await Usuario.findByIdAndUpdate(
                req.usuario.id,
                { nombre, telefono, direccion },
                { new: true, runValidators: true }
            ).select('-password');

            if (!usuario) {
                return res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });
            }

            res.json({
                mensaje: 'Perfil actualizado exitosamente',
                usuario
            });
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            res.status(500).json({
                mensaje: 'Error al actualizar perfil',
                error: error.message
            });
        }
    },

    // Actualizar usuario (desde admin)
    actualizar: async (req, res) => {
        try {
            const { nombre, email, telefono, rol, activo, password } = req.body;
            const updateData = { nombre, email, telefono, rol, activo };
            
            if (password) {
                updateData.password = password;
            }

            const usuario = await Usuario.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');

            if (!usuario) {
                return res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });
            }

            res.json({
                mensaje: 'Usuario actualizado exitosamente',
                usuario
            });
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({
                mensaje: 'Error al actualizar usuario',
                error: error.message
            });
        }
    },

    // Toggle estado del usuario
    toggleEstado: async (req, res) => {
        try {
            const { activo } = req.body;
            
            const usuario = await Usuario.findByIdAndUpdate(
                req.params.id,
                { activo },
                { new: true }
            ).select('-password');

            if (!usuario) {
                return res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });
            }

            res.json({
                mensaje: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`,
                usuario
            });
        } catch (error) {
            console.error('Error al cambiar estado del usuario:', error);
            res.status(500).json({
                mensaje: 'Error al cambiar estado del usuario',
                error: error.message
            });
        }
    }
};

module.exports = usuarioController;