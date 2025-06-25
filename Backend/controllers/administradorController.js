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
  try {
    console.log('🚀 POST /login ejecutado')
    console.log('=== DEBUG LOGIN ===');
    console.log('Headers:', req.headers);
    console.log('Body raw:', req.body);
    
    const { email, password } = req.body;
    console.log('Email extraído:', email);
    console.log('Password extraído:', password);
    
    // Validación de datos requeridos
    if (!email || !password) {
      console.log('Faltan datos obligatorios');
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // DEBUGGIN TEMPORAL (TESTEAMOS EL LOGIN EN EL BACKEND, daba error de credenciales)

    // Buscar administrador por email
    console.log(' Buscando admin con email:', email);
    const admin = await Administrator.findOne({ 
      where: { email: email.toLowerCase().trim() } 
    });
    
    // console.log('Admin encontrado:', admin ? `ID: ${admin.id}, Email: ${admin.email}` : 'null');
    
    // if (!admin) {
    //   console.log('Admin no encontrado');
    //   return res.status(401).json({ error: 'Credenciales inválidas' });
    // }

    // Verificar contraseña
    // console.log('Verificando contraseña...');
    // console.log('Password recibido:', password);
    // console.log('Hash almacenado:', admin.passwordHash);

    // console.log('Versión de bcrypt:', require('bcrypt/package.json').version);
    // console.log('Longitud del hash:', admin.passwordHash.length);

    // // Probar manualmente el hash que sabemos que funciona
    // const testHash = '$2b$10$N9qo8uLOickgx2ZMyubHOOGaQCOMNDTAOsxOOLNsW1e2cXAiuLuW6';
    // const testMatch = await bcrypt.compare('password123', testHash);
    // console.log('Test con hash conocido:', testMatch);

    // // Generar un hash nuevo para comparar
    // const newHash = await bcrypt.hash('password123', 10);
    // console.log('Hash nuevo generado:', newHash);
    // const newMatch = await bcrypt.compare('password123', newHash);
    // console.log('Match con hash nuevo:', newMatch);

    // const match2 = await bcrypt.compare(password, admin.passwordHash);
    // console.log('Password match original:', match2);
    
    // Verificar contraseña
    console.log('Verificando contraseña...');
    console.log('Password recibido:', password); // Agrega esta línea
    console.log('Hash almacenado:', admin.passwordHash); // Opcional: también ver el hash
    const match = await bcrypt.compare(password, admin.passwordHash);
    console.log('Password match:', match);
    
    if (!match) {
      console.log('Contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    console.log('Generando token...');
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        email: admin.email,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Login exitoso para:', admin.email);
    
    // Respuesta exitosa
    return res.status(200).json({ 
      message: 'Login exitoso', 
      token,
      email: admin.email,
      adminId: admin.id
    });

  } catch (error) {
    console.error('💥 Error en loginAdministrator:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
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