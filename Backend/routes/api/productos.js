const express = require('express');
const router = express.Router();
const {
  getProductosActivos,
  getProductoById,
  createProducto,
  updateProducto,
  toggleProducto,
  eliminarProducto
} = require('../../controllers/productosController');

// 1) Listar productos activos
//    GET /api/productos
router.get('/', getProductosActivos);

// 2) Obtener producto por id
router.get('/:id', getProductoById)

// 3) Crear producto (ADMINS si lo protegés luego con middleware)
//    POST /api/productos
router.post('/', createProducto);

// 4) Actualizar producto
//    PUT /api/productos/:id
router.put('/:id', updateProducto);

// 5) Activar / Desactivar (toggle)
//    PATCH /api/productos/:id/toggle
router.patch('/:id/toggle', toggleProducto);

// 6) Eliminar producto - NOTA: Revisar la lógica del toggleProducto, punto 5, justo arriba :)
router.delete('/:id', eliminarProducto);

module.exports = router;

