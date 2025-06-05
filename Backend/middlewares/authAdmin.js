// Backend/middlewares/authAdmin.js

module.exports = (req, res, next) => {
  if (req.session && req.session.adminId) {
    // Existe una sesión válida de administrador
    return next();
  }
  return res.status(401).json({ error: 'No autorizado. Debe iniciar sesión como administrador.' });
};