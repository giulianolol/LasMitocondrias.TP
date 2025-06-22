// Backend/middlewares/authAdmin.js

module.exports = (req, res, next) => {
  // Acá comprobamos si existe un objeto `session` en la petición y si tiene una propiedad 'adminId' que sería el id del administrador
  if (req.session && req.session.adminId) {
    //Si existe una sesión válida, le decimos a express que siga con el next() para contiunar con el flow/flujo, ya sea otro middleware o ruta x
    return next();
  }
  // caso que no haya una sesion de admin, responde con un forbbiden 401 y un json donde especificando que no está autorizado
  return res.status(401).json({ error: 'No autorizado. Debe iniciar sesión como administrador.' });
};