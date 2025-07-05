const { Console } = require('console');
const path = require('path');
const db = require(path.join(__dirname, '..', 'models', 'index.js'));
// const db = require('../models');
const Product = db.Product;

//GET /api/productos
//Devuelve un array de todos los productos.
exports.getProductos = async (req, res) => {
  try {
    const productos = await Product.findAll({
      order: [['name', 'ASC']]
    });
    return res.status(200).json(productos);
  } catch (err) {
    console.error('Error en getProductos:', err);
    return res.status(500).json({ error: 'Error al consultar productos' });
  }
};

//POST /api/productos
//Crea un nuevo producto. El body debe incluir:
//{ name, description, price, stock, active, imageUrl, type }

exports.createProducto = async (req, res) => {
  try {
    const {
      name,
      description = null,
      price,
      stock = null,
      active,
      imageUrl = null,
      type
    } = req.body;

    // Validación mínima
    if (!name || price == null || !type) {
      return res.status(400).json({ error: 'Faltan datos obligatorios: name, price o type' });
    }

    const nuevo = await Product.create({
      name,
      description,
      price,
      stock,
      active: active === 'true' || active === true,
      imageUrl,
      type
    });

    return res.status(201).json(nuevo);

  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeDatabaseError') {
      console.error('Sequelize error:', JSON.stringify(err.errors, null, 2));
      return res.status(400).json({
        error: 'Error de validación de Sequelize',
        details: err.errors?.map(e => ({
          field: e.path,
          message: e.message,
          type: e.type,
          value: e.value
        }))
      });
    }

    console.error('Error en createProducto:', err);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: err.message
    });
  }
};


/**
 * PUT /api/productos/:id
 * Actualiza un producto existente (todos los campos menos id).
 * Body: { name, type, price, imageUrl, active (opcional) }
 */
exports.updateProducto = async (req, res) => {
  try {
    console.log(' BODY:', req.body);
    console.log(' PARAMS ID:', req.params.id);

    const { name, description, price, stock, type, active } = req.body;

    const updates = {};
    if (name        !== undefined) updates.name        = name;
    if (description !== undefined) updates.description = description;
    if (price       !== undefined) updates.price       = price;
    if (stock       !== undefined) updates.stock       = stock;
    if (type        !== undefined) updates.type        = type;
    if (active      !== undefined) updates.active      = active;

    console.log(' Updates a aplicar:', updates);

    // CAMBIO AQUÍ: usar id_product en lugar de id
    const [rowsUpdated] = await Product.update(
      updates,
      { where: { id_product: Number(req.params.id) }, returning: true }
    );

    if (rowsUpdated === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // CAMBIO AQUÍ: usar id_product también en findByPk
    const productoActualizado = await Product.findByPk(req.params.id);
    res.json(productoActualizado);
  } catch (error) {
    console.error(' Error en updateProducto:', error);
    res.status(500).json({ message: 'Error interno del servidor', detalle: error.message });
  }
};


//PATCH /api/productos/:id/toggle
//Invierte el valor booleano de 'active'

exports.toggleProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Product.findByPk(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    producto.active = !producto.active;
    await producto.save();
    return res.status(200).json({ id: producto.id, active: producto.active });
  } catch (err) {
    console.error('Error en toggleActive:', err);
    return res.status(500).json({ error: 'Error al cambiar estado' });
  }
};

exports.eliminarProducto = async (req, res) => {
  //Obtener el ID de la URL
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    //Buscar en la base de datos
    const product = await Product.findByPk(id);
    if (!product) {
      // No existe → 404
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Sí existe → eliminar
    await product.destroy();

    // Responder éxito
    return res.json({ msg: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getProductoById = async (req, res) => {
  try {
    const producto = await Product.findByPk(req.params.id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    console.error('Error en getProductoById:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
