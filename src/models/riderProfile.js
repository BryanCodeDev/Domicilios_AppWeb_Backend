const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RiderProfile = sequelize.define('RiderProfile', {
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
  vehiculo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  placa: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  lat_actual: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  lng_actual: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  calificacion: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 5.00,
    validate: { min: 0, max: 5 }
  },
  total_entregas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'rider_profiles',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'], unique: true },
    { fields: ['disponible'] }
  ]
});

RiderProfile.associate = (models) => {
  RiderProfile.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
};

module.exports = RiderProfile;
