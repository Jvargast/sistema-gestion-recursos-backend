import sequelize from "./database.js";

async function removeFullTextIndexes() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión establecida con éxito.");

    const dropQueries = [
      `DROP INDEX IF EXISTS idx_fulltext_clientes_nombre_rut;`,
      `DROP INDEX IF EXISTS idx_fulltext_productos_nombre;`,
      `DROP INDEX IF EXISTS idx_fulltext_insumos_nombre;`,
      `DROP INDEX IF EXISTS idx_fulltext_camiones_placa;`,
      `DROP INDEX IF EXISTS idx_fulltext_pedidos;`,
      `DROP INDEX IF EXISTS idx_fulltext_ventas;`,
      `DROP INDEX IF EXISTS idx_fulltext_cotizaciones;`,
      `DROP INDEX IF EXISTS idx_fulltext_pagos;`,
      `DROP INDEX IF EXISTS idx_fulltext_cuentasxcobrar;`,
    ];

    for (const query of dropQueries) {
      console.log(`➡️ Ejecutando: ${query}`);
      await sequelize.query(query);
    }

    console.log(
      "✅ Todos los índices full-text han sido eliminados con éxito."
    );
  } catch (error) {
    console.error("❌ Error al eliminar índices full-text:", error);
  } finally {
    await sequelize.close();
    console.log("✅ Conexión cerrada.");
  }
}

removeFullTextIndexes();
