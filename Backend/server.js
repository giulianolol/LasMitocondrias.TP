require('dotenv').config();
const path = require('path')
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const methodOverride = require('method-override')

// Importar la conexión y modelos
const db = require('./models');
const authAdmin = require('./middlewares/authAdmin');
const adminController = require('./controllers/administradorController')
const productosController = require('./controllers/productosController');
const ventasController = require('./controllers/ventasControllers');
const productosRouter = require('./routes/api/productos');
const ventasRouter = require('./routes/api/ventas');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares básicos SIN MODIFCACIONES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')) //Para PUT/PATCH en formularios

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

//Sincronizamos la base y montamos las rutas
db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Tablas sincronizadas en la DB.');

    app.use('/api/test', require('./routes/api/test')); // RUTA PARA TESTEAR
    
    app.get('/admin/login', (req, res) => {  res.render('admin/login', { error: null }); });
    app.post('/admin/login', adminController.loginAdministrator, (req, res) => { res.redirect('/admin/dashboard'); });
    app.post('/admin/logout', adminController.logoutAdministrator, (req, res) => { res.redirect('/admin/login'); });

    app.get('/admin/dashboard', authAdmin, async (req, res) => { const productos = await db.Product.findAll({ order: [['id', 'ASC']] }); res.render('admin/dashboard', { productos }); });

    app.get('/admin/productos/new', authAdmin, (req, res) => {  res.render('admin/product-form', { producto: null });    });
    app.post('/admin/productos', authAdmin, productosController.createProducto, (req, res) => {res.redirect('/admin/dashboard'); });
    app.get('/admin/productos/:id/edit', authAdmin, async (req, res) => { const producto = await db.Product.findByPk(req.params.id); if (!producto) return res.redirect('/admin/dashboard'); res.render('admin/product-form', { producto }); });
    app.put('/admin/productos/:id', authAdmin, productosController.updateProducto, (req, res) => { res.redirect('/admin/dashboard'); });
    app.post('/admin/productos/:id/toggle', authAdmin, productosController.toggleProducto, (req, res) => { res.redirect('/admin/dashboard'); });

    app.use('/api/administradores', require('./routes/api/administradores')) //RUTA DE ADMIN
    app.use( '/api/productos', (req, res, next) => { if (req.method === 'GET') return next(); return authAdmin(req, res, next); }, productosRouter );
    app.use( '/api/ventas', (req, res, next) => { if (req.method === 'POST') return next(); return authAdmin(req, res, next); }, ventasRouter );

    //Manejo de 404
    app.use((req, res, next) => { if (req.originalUrl.startsWith('/api/')) { return res.status(404).json({ error: 'Recurso no encontrado' }); } return res.status(404).send('Página no encontrada');});
    
    //Error handler
    app.use((err, req, res, next) => { console.error(err); if (req.originalUrl.startsWith('/api/')) { return res.status(500).json({ error: 'Error interno del servidor' }); } return res.status(500).send('Error interno del servidor'); });
    
    // Arrancar servidor
    app.listen(PORT, () => { console.log(`Servidor corriendo en http://localhost:${PORT}/admin/login`); });
})

.catch((err) => { console.error('Error al sincronizar la DB:', err); });