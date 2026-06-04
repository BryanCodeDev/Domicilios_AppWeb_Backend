const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
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
  mp_payment_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  monto: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: { min: 0 }
  },
  estado: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'REFUNDED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  metodo: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['order_id'], unique: true },
    { fields: ['estado'] }
  ]
});

Payment.associate = (models) => {
  Payment.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
};

module.exports = Payment;
