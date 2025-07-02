// // Backend/middlewares/authAdmin.js

// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//   // Extraer token del header Authorization
//   const authHeader = req.headers.authorization;
//   const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
  
//   if (!token) {
//     return res.status(401).json({ error: 'No autorizado. Token requerido.' });
//   }

//   try {
//     // Verificar y decodificar el token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.adminId = decoded.adminId; // Guardar adminId en req para usarlo después
//     return next();
//   } catch (error) {
//     return res.status(401).json({ error: 'Token inválido o expirado.' });
//   }
// };

const jwt = require('jsonwebtoken');
require('dotenv').config();

/// <summary>
/// Verifica la validez de un token JWT proporcionado en la cabecera de la solicitud.
/// </summary>
/// <param name="req">La solicitud HTTP que contiene el token en la cabecera 'Authorization'.</param>
/// <param name="res">La respuesta HTTP que se enviará de vuelta al cliente.</param>
/// <param name="next">La función que se llama para pasar el control al siguiente middleware.</param>
/// <returns>Si el token es válido, se añade el usuario decodificado a la solicitud y se llama a next(). Si no, se devuelve un error 401.</returns>
const verificarToken = async (req, res, next) => {
    try {
        const tokenSinFormatear = req.headers['authorization'];
        const decoded = jwt.verify(tokenSinFormatear.split(' ')[1], process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};

/// <summary>
/// Verifica si el usuario tiene el rol de 'admin' a partir del token JWT proporcionado en la cabecera de la solicitud.
/// </summary>
/// <param name="req">La solicitud HTTP que contiene el token en la cabecera 'Authorization'.</param>
/// <param name="res">La respuesta HTTP que se enviará de vuelta al cliente.</param>
/// <param name="next">La función que se llama para pasar el control al siguiente middleware si el rol es válido.</param>
/// <returns>Si el rol es 'admin', se llama a next(). Si no, se devuelve un mensaje de acceso denegado. En caso de token inválido, se devuelve un error 401.</returns>
const tokenAdmin = async (req, res, next) => {
    try {
        const tokenSinFormatear = req.headers['authorization'];
        const decoded = jwt.verify(tokenSinFormatear.split(' ')[1], process.env.JWT_SECRET);
        console.log(decoded);
        if (decoded.role === 'admin') {
            next();
        }
        else {
            res.status(201).json({ message: 'Acceso denegado' })
        }
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};

module.exports = {
    verificarToken,
    tokenAdmin
}
