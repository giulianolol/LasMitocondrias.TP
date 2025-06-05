// Backend/routes/api/test.js
const express = require('express');
const router = express.Router();
const db = require('../../models/product');

router.get('/', async (req, res) => {
  try {
    // Intentamos traer productos para comprobar que la connect funcione
    // si no hay Product en models/index.js, devolvemos un mensaje generico
    if (!db.Product) {
      return res.json({ message: 'Conexión exitosa, pero no hay modelo Product definido aún.' });
    }
    const productos = await db.Product.findAll();
    console.log(productos)
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo obtener productos' });
  }
});

module.exports = router;