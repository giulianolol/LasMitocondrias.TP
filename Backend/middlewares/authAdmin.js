// Backend/middlewares/authAdmin.js

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Extraer token del header Authorization
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ error: 'No autorizado. Token requerido.' });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.adminId; // Guardar adminId en req para usarlo después
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};