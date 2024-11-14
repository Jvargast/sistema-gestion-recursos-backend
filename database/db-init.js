import sequelize from './database.js'; // Importa la configuración de la base de datos
import app from './app.js'; // Importa la instancia de Express desde otro archivo (veremos `app.js` abajo)

/**
 * Función para iniciar la conexión a la base de datos y el servidor.
 * @param {number} port - Puerto en el que se iniciará el servidor.
 */
async function startServer(port) {
  try {
    // Intentar autenticar la conexión a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida con éxito.');

    // Sincronizar modelos con la base de datos
    await sequelize.sync({ alter: true }); // `alter: true` ajusta los modelos según cambios (solo en desarrollo)

    // Iniciar el servidor
    app.listen(port, () => {
      console.log(`Servidor escuchando en el puerto ${port}`);
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1); 
  }
}

export default startServer;