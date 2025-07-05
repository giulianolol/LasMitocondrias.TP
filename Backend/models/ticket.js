// models/ticket.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Ticket', {
    id_venta:   { type: DataTypes.BIGINT, allowNull: false },
    id_product: { type: DataTypes.BIGINT, allowNull: false },
    user_name:  { type: DataTypes.STRING,  allowNull: false },
    // created_at se toma por default
  }, {
    tableName:  'ticket',
    timestamps: false
  });
};
