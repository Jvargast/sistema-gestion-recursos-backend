import sequelize from './database.js';

//Carga de asociaciones por módulo
//import loadAnalisisAssociations from '../geografia/domain/associate-models.js';
import loadAuthAssociations from '../auth/domain/associate-models.js';
//import loadGeografiaAssociations from '../geografia/domain/associate-models.js';
//import loadInventarioAssociations from '../inventario/domain/associate-models.js';
//import loadManagementAssociations from '../management/domain/associate-models.js';
//import loadProveedoresAssociations from '../proveedores/domain/associate-models.js';
//import loadVentasAssociations from '../ventas/domain/associate-models.js';


//Se inicializa la base datos
async function initializeDatabase() {
  try {
    // Intentar autenticar la conexión a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida con éxito.');

    //Cargas las asociaciones
    //loadAnalisisAssociations();
    loadAuthAssociations();
    //loadGeografiaAssociations();
    //loadInventarioAssociations();
    //loadManagementAssociations();
    //loadProveedoresAssociations();
    //loadVentasAssociations();

    // Sincronizar modelos con la base de datos
    await sequelize.sync({ alter: true }); // `alter: true` ajusta los modelos según cambios (solo en desarrollo)
    console.log('Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    throw error; // Lanza el error para manejarlo en index.js
  }
}

export default initializeDatabase;