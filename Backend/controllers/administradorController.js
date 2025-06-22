// Backend/controllers/administradorController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');
const Administrator = db.Administrator;

/**
 * POST /api/administradores/register
 * Sin cambios
 */
exports.registerAdministrator = async (req, res) => {

  console.log('BODY:', req.body);

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const existente = await Administrator.findOne({ where: { email } });
    if (existente) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    //Aca hasheamos la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const nuevoAdmin = await Administrator.create({ email, passwordHash });
    return res.status(201).json({ id: nuevoAdmin.id, email: nuevoAdmin.email });
  } catch (err) {
    console.error('Error en registerAdministrator:', err);
    return res.status(500).json({ error: err.message || 'Error al registrar administrador' });
  }
};

/**
 * POST /api/administradores/login
 * PRINCIPAL CAMBIO: generamos JWT en lugar de sesión
 */
exports.loginAdministrator = async (req, res, next) => {
  
  // TEST
  console.log('Headers:', req.headers);
  console.log('Body raw:', req.body);
  // const { email, password } = req.body;

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    // Buscamos email
    const admin = await Administrator.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    // Hacemos match de credenciales con deshasheo de password
    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // CAMBIO PRINCIPAL: Generamos JWT en lugar de guardar en sesión
    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // mismo tiempo que teniamos configurado en las cookies (una hora)
    );

    // Si es API, devolvemos el token para validación
    if (req.originalUrl.startsWith('/api/')) {
      return res.json({ 
        message: 'Login exitoso', 
        token,
        email: admin.email 
      });
    }

    // Si es web guardamos el token temporalmente y contiunamos
    req.authToken = token;
    return next();

  } catch (err) {
    console.error('Error en loginAdministrator:', err);
    return res.status(500).json({ error: err.message || 'Error al hacer login' });
  }
};

/**
 * POST /api/administradores/logout
 * Acá hay un cambio respecto al manejo de cookies, ya no tenemos que desturir nada cuando usamos jwt, solo le eliminamos al token del cliente
 */
exports.logoutAdministrator = async (req, res, next) => {
  try {
    // Con JWT el logout es simplemente eliminar el token del cliente
    if (req.originalUrl.startsWith('/api/')) {
      return res.json({ message: 'Logout exitoso. Elimine el token del cliente.' });
    }
    
    // Para rutas web, simplemente continuamos
    return next();
  } catch (err) {
    console.error('Error en logoutAdministrator:', err);
    return res.status(500).json({ error: err.message || 'Error al hacer logout' });
  }
};