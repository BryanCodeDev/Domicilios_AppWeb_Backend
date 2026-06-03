const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Business = sequelize.define('Business', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
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
  categoria: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  lat: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  lng: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  logo_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  horario: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'businesses',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['categoria'] }
  ]
});

Business.associate = (models) => {
  Business.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Business.hasMany(models.Product, { foreignKey: 'business_id', as: 'products' });
  Business.hasMany(models.Order, { foreignKey: 'business_id', as: 'orders' });
  Business.hasMany(models.Commission, { foreignKey: 'business_id', as: 'commissions' });
};

module.exports = Business;