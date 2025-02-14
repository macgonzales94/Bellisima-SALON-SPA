// src/controllers/chatController.js
const Mensaje = require('../models/mensajeModels');

const chatController = {
    // Obtener historial de mensajes
    obtenerHistorial: async (req, res) => {
        try {
            const { sala } = req.params;
            const mensajes = await Mensaje.find({ sala })
                .populate('usuario', 'nombre')
                .sort({ createdAt: -1 })
                .limit(50);

            res.json(mensajes);
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener historial',
                error: error.message
            });
        }
    },

    // Marcar mensajes como leídos
    marcarLeidos: async (req, res) => {
        try {
            const { sala } = req.params;
            await Mensaje.updateMany(
                { sala, leido: false },
                { $set: { leido: true } }
            );

            res.json({ mensaje: 'Mensajes marcados como leídos' });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al marcar mensajes',
                error: error.message
            });
        }
    }
};
module.exports = chatController;