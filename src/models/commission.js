const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Commission = sequelize.define('Commission', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'orders', key: 'id' }
  },
  business_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'businesses', key: 'id' }
  },
  repartidor_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  porcentaje_neg: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 15.00,
    validate: { min: 0, max: 100 }
  },
  porcentaje_rep: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 10.00,
    validate: { min: 0, max: 100 }
  },
  monto_negocio: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  monto_repartidor: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('PENDIENTE', 'PAGADO', 'CANCELADO'),
    allowNull: false,
    defaultValue: 'PENDIENTE'
  }
}, {
  tableName: 'commissions',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['order_id'] },
    { fields: ['business_id'] },
    { fields: ['repartidor_id'] }
  ]
});

Commission.associate = (models) => {
  Commission.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
  Commission.belongsTo(models.Business, { foreignKey: 'business_id', as: 'business' });
  Commission.belongsTo(models.User, { foreignKey: 'repartidor_id', as: 'rider' });
};

module.exports = Commission;
