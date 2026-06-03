const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('cliente', 'negocio', 'repartidor', 'admin'),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  avatar_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fcm_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reset_token: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  reset_token_expiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

User.associate = (models) => {
  User.hasOne(models.Business, { foreignKey: 'user_id', as: 'business' });
  User.hasOne(models.RiderProfile, { foreignKey: 'user_id', as: 'riderProfile' });
  User.hasMany(models.Order, { foreignKey: 'cliente_id', as: 'clientOrders' });
  User.hasMany(models.Order, { foreignKey: 'repartidor_id', as: 'riderOrders' });
  User.hasMany(models.Commission, { foreignKey: 'repartidor_id', as: 'commissions' });
  User.hasMany(models.Rating, { foreignKey: 'from_user_id', as: 'givenRatings' });
  User.hasMany(models.Rating, { foreignKey: 'to_user_id', as: 'receivedRatings' });
};

module.exports = User;
