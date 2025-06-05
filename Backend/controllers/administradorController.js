// Backend/controllers/administradorController.js

const bcrypt = require('bcrypt');
const db = require('../models');
const Administrator = db.Administrator;

/**
 * POST /api/administradores/register
 * Recibe { email, password }
 * hash de contraseña y crea el administrador.
 */
exports.registerAdministrator = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Verificar si ya existe un admin con ese email
    const existente = await Administrator.findOne({ where: { email } });
    if (existente) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear el administrador
    const nuevoAdmin = await Administrator.create({ email, passwordHash });
    return res.status(201).json({ id: nuevoAdmin.id, email: nuevoAdmin.email });
  } catch (err) {
    console.error('Error en registerAdministrator:', err);
    return res.status(500).json({ error: err.message || 'Error al registrar administrador' });
  }
};

/**
 * POST /api/administradores/login
 * Recibe { email, password }. Verifica y crea sesión.
 */
exports.loginAdministrator = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Buscar admin
    const admin = await Administrator.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Comparar hashes
    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Crear sesión: guardamos el id del administrador en la sesión
    req.session.adminId = admin.id;
    return res.json({ message: 'Login exitoso', email: admin.email });
  } catch (err) {
    console.error('Error en loginAdministrator:', err);
    return res.status(500).json({ error: err.message || 'Error al hacer login' });
  }
};

/**
 * POST /api/administradores/logout
 * Destruye la sesión del administrador.
 */
exports.logoutAdministrator = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error al destruir sesión:', err);
        return res.status(500).json({ error: 'No se pudo cerrar sesión' });
      }
      // Opcional: limpiar cookie en el frontend
      res.clearCookie('connect.sid');
      return res.json({ message: 'Logout exitoso' });
    });
  } catch (err) {
    console.error('Error en logoutAdministrator:', err);
    return res.status(500).json({ error: err.message || 'Error al hacer logout' });
  }
};
