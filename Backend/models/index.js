// Backend/models/index.js

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const path = require('path');
const administrator = require('./administrator');

// 1) Inicializar Sequelize
const sequelize = new Sequelize(process.env.SUPABASE_DB_URL, {
  dialect: 'postgres',
  logging: false,
});

// 2) Verificar la conexión
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la DB exitosa.');
  } catch (err) {
    console.error('No se pudo conectar a la DB:', err);
  }
})();

// 3) Importar los modelos (las funciones de product.js y ventas.js)
const Product = require('./product')(sequelize, DataTypes)
const Administrator = require(path.join(__dirname, 'administrator'))(sequelize, DataTypes)
const Venta   = require(path.join(__dirname, 'ventas'))(sequelize, DataTypes) //VERIFIAR FUNCIONAMIENTO DE VENTA, OJO CON RUTA DE DIRECTORIO

console.log('db.Product:', Product);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 4) Guardar los modelos en db
db.Product = Product;
db.Venta   = Venta;
db.Administrator = Administrator;

// 5) Definir asociaciones (osea las foreign keys)
Product.hasMany(Venta, { foreignKey: 'id_venta', sourceKey: 'id_product' });
Venta.belongsTo(Product, { foreignKey: 'id_venta', targetKey: 'id_product', as: 'producto' });


module.exports = db;
