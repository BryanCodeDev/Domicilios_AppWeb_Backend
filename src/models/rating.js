const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rating = sequelize.define('Rating', {
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
  from_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  to_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  rol_calificado: {
    type: DataTypes.ENUM('repartidor', 'negocio'),
    allowNull: false
  },
  puntaje: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'ratings',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['order_id'] },
    { fields: ['to_user_id'] }
  ]
});

Rating.associate = (models) => {
  Rating.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
  Rating.belongsTo(models.User, { foreignKey: 'from_user_id', as: 'fromUser' });
  Rating.belongsTo(models.User, { foreignKey: 'to_user_id', as: 'toUser' });
};

module.exports = Rating;
