// controllers/cuponController.js
const Cupon = require('../models/Cupon');
const jwt = require('jsonwebtoken');

const cuponController = {
    crear: async (req, res) => {
        try {
            const cupon = new Cupon(req.body);
            await cupon.save();
            res.status(201).json({
                mensaje: 'Cupón creado exitosamente',
                cupon
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al crear cupón',
                error: error.message
            });
        }
    },

    validar: async (req, res) => {
        try {
            const { codigo } = req.body;
            const cupon = await Cupon.findOne({
                codigo: codigo.toUpperCase(),
                activo: true,
                fechaInicio: { $lte: new Date() },
                fechaFin: { $gte: new Date() }
            });

            if (!cupon) {
                return res.status(404).json({
                    mensaje: 'Cupón no válido o expirado'
                });
            }

            if (cupon.usoMaximo && cupon.usosActuales >= cupon.usoMaximo) {
                return res.status(400).json({
                    mensaje: 'Cupón alcanzó el límite de uso'
                });
            }

            res.json(cupon);
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al validar cupón',
                error: error.message
            });
        }
    }
};

module.exports = cuponController;