const express = require('express');
const {verificarToken,tokenAdmin} = require('../../middlewares/authAdmin');
const router = express.Router();
const {
  getProductos,
  getProductosActivos,
  getProductoById,
  createProducto,
  updateProducto,
  toggleProducto,
  eliminarProducto
} = require('../../controllers/productosController');

// 1) Listar productos 
//    GET /api/productos
router.get('/', getProductos);

// 1) Listar productos activos
//    GET /api/productos/activos
router.get('/activos', getProductosActivos);

// 2) Obtener producto por id
router.get('/:id', getProductoById)

// 3) Crear producto (ADMINS si lo protegés luego con middleware)
//    POST /api/productos
router.post('/', verificarToken,tokenAdmin, createProducto);

// 4) Actualizar producto
//    PUT /api/productos/:id
router.put('/:id',verificarToken,tokenAdmin, updateProducto);

// 5) Activar / Desactivar (toggle)
//    PATCH /api/productos/:id/toggle
router.patch('/:id/toggle', verificarToken,tokenAdmin,toggleProducto);

// 6) Eliminar producto - NOTA: Revisar la lógica del toggleProducto, punto 5, justo arriba :)
router.delete('/:id',verificarToken,tokenAdmin, eliminarProducto);

module.exports = router;

