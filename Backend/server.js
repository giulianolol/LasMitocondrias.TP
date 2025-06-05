require('dotenv').config();
const path = require('path')
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

// Importar la conexión y modelos
const db = require('./models');
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares básicos SIN MODIFCACIONES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessiones - Modelo listo, falta implementar
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: new SequelizeStore({ db: db.sequelize }),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60, sameSite: true },
  })
);

//Sincronizamos la base y montamos las rutas
db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Tablas sincronizadas en la DB.');

    app.use('/api/test', require('./routes/api/test')); // RUTA PARA TESTEAR
    
    app.use('/api/productos', require('./routes/api/productos'));

    app.use('/api/ventas', require('./routes/api/ventas'))
    
    //Manejo de 404
    app.use((req, res, next) => {
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(404).json({ error: 'Recurso no encontrado' });
        }
        return res.status(404).send('Página no encontrada');
    });
    
    //Error handler
    app.use((err, req, res, next) => {
        console.error(err);
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        return res.status(500).send('Error interno del servidor');
    });
    
    // Arrancar servidor
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });

})
.catch((err) => {
    console.error('Error al sincronizar la DB:', err);
  });
