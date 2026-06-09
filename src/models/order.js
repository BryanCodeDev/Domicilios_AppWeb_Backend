const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  cliente_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  repartidor_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  business_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'businesses', key: 'id' }
  },
  estado: {
    type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: { min: 0 }
  },
  direccion_entrega: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  lat_entrega: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  lng_entrega: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'orders',
  timestamps: true,
  underscored: true,
  paranoid: true,
  indexes: [
    { fields: ['cliente_id'] },
    { fields: ['repartidor_id'] },
    { fields: ['business_id'] },
    { fields: ['estado'] },
    { fields: ['created_at'] }
  ]
});

Order.associate = (models) => {
  Order.belongsTo(models.User, { foreignKey: 'cliente_id', as: 'client' });
  Order.belongsTo(models.User, { foreignKey: 'repartidor_id', as: 'rider' });
  Order.belongsTo(models.Business, { foreignKey: 'business_id', as: 'business' });
  Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'orderItems' });
  Order.hasOne(models.Payment, { foreignKey: 'order_id', as: 'payment' });
  Order.hasOne(models.Delivery, { foreignKey: 'order_id', as: 'delivery' });
  Order.hasOne(models.Rating, { foreignKey: 'order_id', as: 'rating' });
};

module.exports = Order;

