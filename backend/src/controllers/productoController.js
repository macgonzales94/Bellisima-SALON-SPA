// controllers/productoController.js
const Producto = require('../models/Producto');
const jwt = require('jsonwebtoken'); 

const productoController = {
    // Crear un nuevo producto (solo admin)
    crear: async (req, res) => {
        try {
            // Registro de depuración
            console.log('Datos recibidos:', req.body);
            console.log('Archivos recibidos:', req.file);

            // Usar directamente req.body si no hay parseo de JSON
            const productoData = req.body;
    
            const producto = new Producto(productoData);
            await producto.save();
    
            res.status(201).json({
                mensaje: 'Producto creado exitosamente',
                producto
            });
        } catch (error) {
            console.error('Error al crear producto:', error);
            res.status(500).json({
                mensaje: 'Error al crear producto',
                error: error.message
            });
        }
    },
 
    // Obtener todos los productos
    listar: async (req, res) => {
        try {
            const { categoria, busqueda, ordenar, pagina = 1, limite = 10 } = req.query;
            
            // Construir query
            let query = { activo: true };
            
            // Filtrar por categoría
            if (categoria) {
                query.categoria = categoria;
            }

            // Búsqueda por texto
            if (busqueda) {
                query.$text = { $search: busqueda };
            }

            // Calcular skip para paginación
            const skip = (pagina - 1) * limite;

            // Obtener productos
            const productos = await Producto.find(query)
                .sort(ordenar === 'precio-asc' ? { precio: 1 } : 
                      ordenar === 'precio-desc' ? { precio: -1 } : 
                      { createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limite));

            // Contar total de productos
            const total = await Producto.countDocuments(query);

            res.json({
                total,
                paginas: Math.ceil(total / limite),
                paginaActual: parseInt(pagina),
                productos
            });
        } catch (error) {
            console.error('Error al listar productos:', error);
            res.status(500).json({
                mensaje: 'Error al listar productos',
                error: error.message
            });
        }
    },

    // Obtener un producto por ID
    obtenerPorId: async (req, res) => {
        try {
            const producto = await Producto.findById(req.params.id);
            
            if (!producto) {
                return res.status(404).json({
                    mensaje: 'Producto no encontrado'
                });
            }

            res.json(producto);
        } catch (error) {
            console.error('Error al obtener producto:', error);
            res.status(500).json({
                mensaje: 'Error al obtener producto',
                error: error.message
            });
        }
    },

    // Actualizar un producto (solo admin)
    actualizar: async (req, res) => {
        try {
            const producto = await Producto.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!producto) {
                return res.status(404).json({
                    mensaje: 'Producto no encontrado'
                });
            }

            res.json({
                mensaje: 'Producto actualizado exitosamente',
                producto
            });
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            res.status(500).json({
                mensaje: 'Error al actualizar producto',
                error: error.message
            });
        }
    },

    // Eliminar un producto (solo admin)
    eliminar: async (req, res) => {
        try {
            const producto = await Producto.findByIdAndDelete(req.params.id);

            if (!producto) {
                return res.status(404).json({
                    mensaje: 'Producto no encontrado'
                });
            }

            res.json({
                mensaje: 'Producto eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            res.status(500).json({
                mensaje: 'Error al eliminar producto',
                error: error.message
            });
        }
    }
};

module.exports = productoController;