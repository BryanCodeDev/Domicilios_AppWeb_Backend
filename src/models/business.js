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
    unique: true,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  horario: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  imagen_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  calificacion_promedio: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 5.00,
    validate: { min: 0, max: 5 }
  }
}, {
  tableName: 'businesses',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'], unique: true },
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
