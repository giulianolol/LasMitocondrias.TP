// Backend/models/administrator.js

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'usuarios',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Debe ser un email válido'
          }
        }
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    },
    {
      tableName: 'usuarios',
      timestamps: true, // createdAt / updatedAt
    }
  );
};
