const db = require('../models');
const { Sequelize } = db;
const Venta   = db.Venta;
const Product = db.Product;


exports.createVenta = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const { nombre_usuario, medio_pago, monto, productos } = req.body;

    if (!nombre_usuario || !medio_pago || monto == null || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Faltan datos: nombre_usuario, medio_pago, monto o productos' });
    }

    // Crear ID único para la venta
    let id_venta;
    let ventaExiste = true;
    while (ventaExiste) {
      const ahora = new Date();
      id_venta = parseInt(
        ahora.getDate().toString().padStart(2, '0') +
        ahora.getHours().toString().padStart(2, '0') +
        ahora.getMinutes().toString().padStart(2, '0') +
        ahora.getSeconds().toString().padStart(2, '0') +
        Math.floor(Math.random() * 100).toString().padStart(2, '0')
      );
      const existeVenta = await db.Venta.findOne({ where: { id_venta } });
      if (!existeVenta) ventaExiste = false;
    }

    // Crear la venta
    const nuevaVenta = await db.Venta.create({
      id_venta,
      nombre_usuario
    }, { transaction: t });

    // Crear tickets por cada producto
    for (const item of productos) {
      const id_product = item.id_product ?? item.id;
      if (!id_product) throw new Error('Falta id_product en uno de los items');

      await db.Ticket.create({
        id_venta,
        id_product,
        user_name: nombre_usuario
      }, { transaction: t });
    }

    // Crear el pago
    const id_tipopago = medio_pago === 'efectivo' ? 1 : medio_pago === 'debito' ? 2 : 3;
    await db.Pago.create({
      id_venta,
      fecha: new Date(),
      monto,
      id_tipopago
    }, { transaction: t });

    await t.commit();
    return res.status(201).json(nuevaVenta);

  } catch (err) {
    console.error('Error en createVenta:', err);
    await t.rollback();
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
