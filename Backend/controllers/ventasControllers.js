const db = require('../models');
const { Sequelize } = db;
const Venta   = db.Venta;
const Product = db.Product;
const Ticket  = db.Ticket;
const Pago    = db.Pago;


exports.createVenta = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { nombre_usuario, medio_pago, monto, productos } = req.body;

    console.log('Productos recibidos:', productos);

    if (!nombre_usuario || !medio_pago || monto == null || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Faltan datos: nombre_usuario, medio_pago, monto o productos' });
    }

    // 1) Generar id_venta único
    let id_venta;
    do {
      const now = new Date();
      id_venta = parseInt(
        now.getDate().toString().padStart(2,'0') +
        now.getHours().toString().padStart(2,'0') +
        now.getMinutes().toString().padStart(2,'0') +
        now.getSeconds().toString().padStart(2,'0') +
        Math.floor(Math.random()*100).toString().padStart(2,'0')
      );
    } while (await Venta.findOne({ where:{ id_venta }, transaction: t }));

    // 2) Crear la venta
    const nuevaVenta = await Venta.create({
      id_venta,
      nombre_usuario
    }, { transaction: t });



    // 3) Crear un ticket por cada producto
    //    (la tabla Ticket tiene columnas: id_venta, id_product, created_at, user_name)
    for (const item of productos) {
      await Ticket.create({
        id_venta:   id_venta,
        id_product: item.id_product,
        user_name:  nombre_usuario
        // created_at toma default NOW
      }, { transaction: t });
    }

    // 4) Mapear medio_pago → id_tipopago
    const tipoMap = { efectivo:1, debito:2, credito:3 };
    const id_tipopago = tipoMap[medio_pago.toLowerCase()];
    if (!id_tipopago) throw new Error('medio_pago inválido');

    // 5) Crear el pago
    await Pago.create({
      id_venta,
      monto,
      id_tipopago
      // fecha toma default NOW
    }, { transaction: t });

    await t.commit();

    return res.status(201).json({ venta: nuevaVenta });
  } catch (err) {
    await t.rollback();
    console.error('Error en createVenta:', err);
    return res.status(500).json({ error: err.message });
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
