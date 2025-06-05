// Backend/models/ventas.js

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'Venta',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      fecha_hora_venta: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      nombre_usuario: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // id_producto se crea al definir la asociación en index.js
    },
    {
      tableName: 'ventas',
      timestamps: false,
    }
  );
};
