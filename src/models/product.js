const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  business_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'businesses', key: 'id' },
    onDelete: 'CASCADE'
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  precio: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: { min: 0 }
  },
  imagen_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'products',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['business_id'] }
  ]
});

Product.associate = (models) => {
  Product.belongsTo(models.Business, { foreignKey: 'business_id', as: 'business' });
  Product.hasMany(models.OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
};

module.exports = Product;
