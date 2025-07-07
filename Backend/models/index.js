// Backend/models/index.js

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const path = require('path');

// Inicializar Sequelize
// const sequelize = new Sequelize(process.env.SUPABASE_DB_URL, {
//   dialect: 'postgres',
//   logging: false,
// });
const sequelize = new Sequelize(process.env.SUPABASE_DB_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // necesario para certificados no verificados
    }
  }
});


// Verificar la conexión
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la DB exitosa.');
  } catch (err) {
    console.error('No se pudo conectar a la DB:', err);
  }
})();

// Importar los modelos
const Product = require(path.join(__dirname, 'product'))(sequelize, DataTypes);
const Administrator = require(path.join(__dirname, 'administrator'))(sequelize, DataTypes);
const Venta = require(path.join(__dirname, 'venta'))(sequelize, DataTypes);
const Ticket = require(path.join(__dirname, 'ticket'))(sequelize, DataTypes);
const Pago = require(path.join(__dirname, 'pago'))(sequelize, DataTypes);

//  Registrar modelos en el objeto db
const db = {
  Sequelize,
  sequelize,
  Product,
  Administrator,
  Venta,
  Ticket,
  Pago,
};

//  Definir asociaciones
// Un Producto puede estar en muchas Ventas (si manejas id_product en Venta)
Product.hasMany(Venta, { foreignKey: 'id_product', sourceKey: 'id_product' });
Venta.belongsTo(Product, { foreignKey: 'id_product', targetKey: 'id_product', as: 'producto' });

// Una Venta puede tener muchos Tickets (uno por producto en la venta)
Venta.hasMany(Ticket, { foreignKey: 'id_venta', sourceKey: 'id_venta' });
Ticket.belongsTo(Venta, { foreignKey: 'id_venta', targetKey: 'id_venta' });

// Una Venta tiene un Pago
Venta.hasOne(Pago, { foreignKey: 'id_venta', sourceKey: 'id_venta' });
Pago.belongsTo(Venta, { foreignKey: 'id_venta', targetKey: 'id_venta' });

module.exports = db;
