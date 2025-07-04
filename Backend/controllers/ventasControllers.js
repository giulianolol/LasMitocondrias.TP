const db = require('../models');
const Venta = db.Venta;
const Product = db.Product;

/**
 * POST /api/ventas
 * Recibe en el body:
 *   {
 *     "id_producto": 123,
 *     "nombre_usuario": "Juan Pérez"
 *   }
 * (fecha_hora_venta se toma automáticamente con defaultValue NOW)
 */

exports.createVenta = async (req, res) => {

  console.log("Estoy acá")

  try {
    const { nombre_usuario } = req.body;

    if (!nombre_usuario) {
      return res.status(400).json({ error: 'Falta el nombre del usuario' });
    }

    // Crear la venta
    const nuevaVenta = await Venta.create({
      nombre_usuario,
    });

    return res.status(201).json(nuevaVenta);
  } catch (err) {
    console.error('Error en createVenta:', err);
    return res.status(500).json({ error: err.message || 'Error al crear venta' });
  }
};

/**
 * GET /api/ventas
 * Devuelve todas las ventas junto con el producto asociado.
 */
exports.getVentas = async (req, res) => {
  try {
    const ventas = await Venta.findAll({
      include: [
        {
          model: Product,
          as: 'producto',
          attributes: ['id', 'name', 'price', 'type', 'imageUrl'],
        },
      ],
      order: [['fecha_hora_venta', 'DESC']],
    });
    return res.status(200).json(ventas);
  } catch (err) {
    console.error('Error en getVentas:', err);
    return res.status(500).json({ error: 'Error al consultar ventas' });
  }
};
