// controllers/categoriaController.js
const Categoria = require('../models/Categoria');
const jwt = require('jsonwebtoken');

const categoriaController = {
    // Crear nueva categoría
    crear: async (req, res) => {
        try {
            const { nombre, descripcion } = req.body;

            // Verificar si ya existe una categoría con ese nombre
            const categoriaExistente = await Categoria.findOne({ nombre });
            if (categoriaExistente) {
                return res.status(400).json({
                    mensaje: 'Ya existe una categoría con ese nombre'
                });
            }

            const categoria = new Categoria({
                nombre,
                descripcion
            });

            await categoria.save();

            res.status(201).json({
                mensaje: 'Categoría creada exitosamente',
                categoria
            });
        } catch (error) {
            console.error('Error al crear categoría:', error);
            res.status(500).json({
                mensaje: 'Error al crear categoría',
                error: error.message
            });
        }
    },

    // Obtener todas las categorías
    listar: async (req, res) => {
        try {
            const categorias = await Categoria.find({ activo: true });
            res.json(categorias);
        } catch (error) {
            console.error('Error al listar categorías:', error);
            res.status(500).json({
                mensaje: 'Error al obtener categorías',
                error: error.message
            });
        }
    },

    // Obtener una categoría por ID
    obtenerPorId: async (req, res) => {
        try {
            const categoria = await Categoria.findById(req.params.id);
            if (!categoria) {
                return res.status(404).json({
                    mensaje: 'Categoría no encontrada'
                });
            }
            res.json(categoria);
        } catch (error) {
            console.error('Error al obtener categoría:', error);
            res.status(500).json({
                mensaje: 'Error al obtener categoría',
                error: error.message
            });
        }
    },

    // Actualizar categoría
    actualizar: async (req, res) => {
        try {
            const { nombre, descripcion } = req.body;

            // Verificar si el nuevo nombre ya existe en otra categoría
            if (nombre) {
                const categoriaExistente = await Categoria.findOne({
                    nombre,
                    _id: { $ne: req.params.id }
                });
                if (categoriaExistente) {
                    return res.status(400).json({
                        mensaje: 'Ya existe una categoría con ese nombre'
                    });
                }
            }

            const categoria = await Categoria.findByIdAndUpdate(
                req.params.id,
                { nombre, descripcion },
                { new: true }
            );

            if (!categoria) {
                return res.status(404).json({
                    mensaje: 'Categoría no encontrada'
                });
            }

            res.json({
                mensaje: 'Categoría actualizada exitosamente',
                categoria
            });
        } catch (error) {
            console.error('Error al actualizar categoría:', error);
            res.status(500).json({
                mensaje: 'Error al actualizar categoría',
                error: error.message
            });
        }
    },

    // Eliminar categoría (soft delete)
    eliminar: async (req, res) => {
        try {
            const categoria = await Categoria.findByIdAndUpdate(
                req.params.id,
                { activo: false },
                { new: true }
            );

            if (!categoria) {
                return res.status(404).json({
                    mensaje: 'Categoría no encontrada'
                });
            }

            res.json({
                mensaje: 'Categoría eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            res.status(500).json({
                mensaje: 'Error al eliminar categoría',
                error: error.message
            });
        }
    }
};

module.exports = categoriaController;