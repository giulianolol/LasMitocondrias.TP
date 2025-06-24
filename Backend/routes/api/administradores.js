// Backend/routes/api/administradores.js

const express = require('express');
const router = express.Router();
const {
  registerAdministrator,
  loginAdministrator,
  logoutAdministrator,
} = require('../../controllers/administradorController');

// Registrar nuevo administrador (idealmente, solo en desarrollo o con protección extra)
router.post('/register', registerAdministrator);

// Login de administrador
router.post('/login', loginAdministrator);

// Logout (destruir sesión)
router.post('/logout', logoutAdministrator);

module.exports = router;

