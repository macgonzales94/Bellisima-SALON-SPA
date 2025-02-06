// models/Usuario.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definimos el esquema del usuario con todos los campos necesarios
const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: 6
    },
    telefono: {
        type: String,
        trim: true
    },
    direccion: {
        calle: String,
        numero: String,
        ciudad: String,
        distrito: String,
        codigoPostal: String
    },
    rol: {
        type: String,
        enum: ['cliente', 'admin'],
        default: 'cliente'
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Método que se ejecuta antes de guardar el usuario
usuarioSchema.pre('save', async function(next) {
    // Si la contraseña no ha sido modificada, continuar
    if (!this.isModified('password')) return next();
    
    try {
        // Generar un salt para el hash
        const salt = await bcrypt.genSalt(10);
        // Crear el hash de la contraseña
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar contraseñas
usuarioSchema.methods.compararPassword = async function(passwordCandidata) {
    return await bcrypt.compare(passwordCandidata, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);