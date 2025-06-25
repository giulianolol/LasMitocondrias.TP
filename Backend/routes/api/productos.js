const express = require('express');
const router = express.Router();
const {
  getProductosActivos,
  createProducto,
  updateProducto,
  toggleProducto,
  eliminarProducto
} = require('../../controllers/productosController');

// 1) Listar productos activos
//    GET /api/productos
router.get('/', getProductosActivos);

// 2) Crear producto (ADMINS si lo protegés luego con middleware)
//    POST /api/productos
router.post('/', createProducto);

// 3) Actualizar producto
//    PUT /api/productos/:id
router.put('/:id', updateProducto);

// 4) Activar / Desactivar (toggle)
//    PATCH /api/productos/:id/toggle
router.patch('/:id/toggle', toggleProducto);

router.delete('/:id', eliminarProducto);

module.exports = router;

