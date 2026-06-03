const sequelize = require('../config/database');

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL exitosa.');
    await sequelize.sync({ force: false, alter: true });
    console.log('Modelos sincronizados con la base de datos.');
    process.exit(0);
  } catch (error) {
    console.error('Error al sincronizar:', error);
    process.exit(1);
  }
};

syncDatabase();
