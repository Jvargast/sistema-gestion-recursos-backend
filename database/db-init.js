import sequelize from "./database.js";

//Carga de asociaciones por módulo
import loadAuthAssociations from "../auth/domain/associate-models.js";
import loadInventarioAssociations from "../inventario/domain/associate-models.js";
import loadSalesAssociations from "../ventas/domain/associate-models.js";
import loadAnalysisAssociations from '../analisis/domain/associate-models.js';
import loadEntregasAssociations from "../Entregas/domain/associate-model.js";
import loadNotificacionAssociations from "../shared/domain/associate-models.js";
//import loadGeografiaAssociations from '../geografia/domain/associate-models.js';
//import loadManagementAssociations from '../management/domain/associate-models.js';
//import loadProveedoresAssociations from '../proveedores/domain/associate-models.js';

async function initializeDatabase() {
  
  try {
    // Intentar autenticar la conexión a la base de datos
    const isProduction = process.env.NODE_ENV === 'production';
    await sequelize.authenticate();
    console.log("Conexión a PostgreSQL establecida con éxito.");

    loadAuthAssociations();
    loadInventarioAssociations();
    loadSalesAssociations();
    loadEntregasAssociations();
    loadNotificacionAssociations();
    loadAnalysisAssociations();

    // Sincronizar modelos con la base de datos
    await sequelize.sync({ alter: isProduction ? true : false }); // `alter: true` ajusta los modelos según cambios (solo en desarrollo)
    console.log("Modelos sincronizados con la base de datos.");
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    throw error;
  }
}

export default initializeDatabase;
