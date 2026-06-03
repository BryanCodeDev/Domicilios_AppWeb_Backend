const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('admin', 'cliente', 'repartidor', 'negocio'),
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
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  fcm_token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reset_token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reset_token_expiry: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['rol'] }
  ]
});

User.associate = (models) => {
  User.hasMany(models.Order, { foreignKey: 'cliente_id', as: 'ordersAsClient' });
  User.hasMany(models.Order, { foreignKey: 'repartidor_id', as: 'ordersAsRider' });
  User.hasMany(models.Delivery, { foreignKey: 'repartidor_id', as: 'deliveries' });
  User.hasMany(models.Rating, { foreignKey: 'from_user_id', as: 'ratingsGiven' });
  User.hasMany(models.Rating, { foreignKey: 'to_user_id', as: 'ratingsReceived' });
  User.hasOne(models.RiderProfile, { foreignKey: 'user_id', as: 'riderProfile' });
  User.hasOne(models.Business, { foreignKey: 'user_id', as: 'business' });
};

module.exports = User;