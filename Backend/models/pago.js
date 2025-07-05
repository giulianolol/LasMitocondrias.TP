// models/pago.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Pago', {
    id_pago:    { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    id_venta:   { type: DataTypes.BIGINT, allowNull: false },
    monto:      { type: DataTypes.DOUBLE, allowNull: false },
    id_tipopago:{ type: DataTypes.BIGINT, allowNull: false },
    // fecha se toma por default
  }, {
    tableName:  'pago',
    timestamps: false
  });
};
