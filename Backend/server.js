require('dotenv').config(); //Cargamos las variables de entorno
const cors = require('cors'); //habilitamos cors, lo que mostró el profe con windsurf
const path = require('path');
const express = require('express');
const methodOverride = require('method-override'); //permitimos usar metodos HTTP (PUT, DELETE, etc.) en formularios HTML

const db = require('./models'); //intanciamos sequalize
const authAdmin = require('./middlewares/authAdmin');
const adminController = require('./controllers/administradorController');
const productosRouter = require('./routes/api/productos');
const ventasRouter = require('./routes/api/ventas');

const app = express();
const PORT = process.env.PORT || 3000;


//Middlewares generales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cors());

db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Tablas con la DB sinconizadas :)');

    // app.use('/api/test', require('./routes/api/test')); //Ruta de testeo

    // Se necesita enviar el token desde el frontend

    // Definimos las RUTAS  y el manejo de errores

    app.use('/api/administradores', require('./routes/api/administradores')); //Montamos el router que maneja todo lo que tiene que ver con administradores

    app.use('/api/productos', (req, res, next) => { 
      if (req.method === 'GET') return next(); 
      return authAdmin(req, res, next); 
    }, productosRouter); // GET: cualquier uusario puede listar o ver productos sin token. POST/PUT/DELETE: antes de llegar al router, tienen que pasar por authAdmin

    app.use('/api/ventas', (req, res, next) => { 
      if (req.method === 'POST') return next(); 
      return authAdmin(req, res, next); 
    }, ventasRouter); //POST: Cualquier usuario puede registar una venta (por ejemplo el cliente). GET/PUT/DELTE: Solo determinados roles

    app.use((req, res, next) => { 
      if (req.originalUrl.startsWith('/api/')) { 
        return res.status(404).json({ error: 'Recurso no encontrado' }); 
      } 
      return res.status(404).send('Página no encontrada'); 
    }); // Si alguna ruta no existe, llega acá

    app.use((err, req, res, next) => { 
      console.error(err); 
      if (req.originalUrl.startsWith('/api/')) { 
        return res.status(500).json({ error: 'Error interno del servidor' }); 
      } 
      return res.status(500).send('Error interno del servidor'); 
    }); //Si hay algun error, llega acá

    

    //Levantamos el servidor
    app.listen(PORT, () => { 
      console.log(`Servidor corriendo en http://localhost:${PORT}/admin/login`); 
    });
  })
  .catch((err) => { 
    console.error('Error al sincronizar la DB:', err); 
  });