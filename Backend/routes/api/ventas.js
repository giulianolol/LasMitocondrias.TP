// Backend/routes/api/ventas.js

const express = require('express');
const router = express.Router();
const {
  createVenta,
  getVentas,
} = require('../../controllers/ventasControllers');

// POST /api/ventas
router.post('/', createVenta);

// GET /api/ventas
router.get('/', getVentas);

module.exports = router;
