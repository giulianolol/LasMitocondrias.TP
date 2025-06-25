const { Console } = require('console');
const path = require('path');
const db = require(path.join(__dirname, '..', 'models', 'index.js'));
// const db = require('../models');
const Product = db.Product;

//GET /api/productos
//Devuelve un array de todos los productos con `active = true`.

exports.getProductosActivos = async (req, res) => {
  try {
    const productos = await Product.findAll({ where: { active: true }, order: [['name', 'ASC']]});
    return res.status(200).json(productos);
  } catch (err) {
    console.error('Error en getProductosActivos:', err);
    return res.status(500).json({ error: 'Error al consultar productos' });
  }
};

//POST /api/productos
//Crea un nuevo producto. El body debe incluir:
//{ name, type, price, imageUrl (opcional) }

exports.createProducto = async (req, res) => {
  try {
    const { name, type, price, imageUrl } = req.body;
    if (!name || !type || price == null) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const nuevo = await Product.create({ name, type, price, imageUrl });
    return res.status(201).json(nuevo);

  } catch (err) {
    console.error('Error en createProducto:', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/productos/:id
 * Actualiza un producto existente (todos los campos menos id).
 * Body: { name, type, price, imageUrl, active (opcional) }
 */
exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, price, imageUrl, active } = req.body;

    const producto = await Product.findByPk(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Actualizar solo las propiedades que vengan en el body
if (name) {producto.name = name;}
if (type) {producto.type = type;}
if (price) {producto.price = price;}
if (imageUrl) {producto.imageUrl = imageUrl;}
if (active !== undefined) {producto.active = active;}

    await producto.save();
    return res.status(200).json(producto);
  } catch (err) {
    console.error('Error en updateProducto:', err);
    return res.status(500).json({ error: 'Error al actualizar producto' });
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