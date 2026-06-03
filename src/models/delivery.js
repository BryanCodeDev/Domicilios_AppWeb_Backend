const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: { model: 'orders', key: 'id' }
  },
  repartidor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  lat_actual: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  lng_actual: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('assigned', 'picked_up', 'en_camino', 'delivered', 'completed'),
    allowNull: false,
    defaultValue: 'assigned'
  }
}, {
  tableName: 'deliveries',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['order_id'], unique: true },
    { fields: ['repartidor_id'] }
  ]
});

Delivery.associate = (models) => {
  Delivery.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
  Delivery.belongsTo(models.User, { foreignKey: 'repartidor_id', as: 'rider' });
};

module.exports = Delivery;
