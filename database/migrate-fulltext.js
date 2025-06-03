import sequelize from "./database.js";

async function addFullTextIndexes() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión establecida con éxito.");

    const queries = [
      // Clientes: nombre + rut
      `CREATE INDEX IF NOT EXISTS idx_fulltext_clientes_nombre_rut ON "Clientes"
       USING gin(to_tsvector('spanish', nombre || ' ' || rut));`,

      // Producto: nombre_producto
      `CREATE INDEX IF NOT EXISTS idx_fulltext_productos_nombre ON "Producto"
       USING gin(to_tsvector('spanish', nombre_producto));`,

      // Insumo: nombre_insumo
      `CREATE INDEX IF NOT EXISTS idx_fulltext_insumos_nombre ON "Insumo"
       USING gin(to_tsvector('spanish', nombre_insumo));`,

      // Camion: placa
      `CREATE INDEX IF NOT EXISTS idx_fulltext_camiones_placa ON "Camion"
       USING gin(to_tsvector('spanish', placa));`,

      // Cotizacion: notas (campo texto)
      `CREATE INDEX IF NOT EXISTS idx_fulltext_cotizaciones_notas ON "Cotizacion"
       USING gin(to_tsvector('spanish', notas));`,

      // Pago: referencia (campo texto)
      `CREATE INDEX IF NOT EXISTS idx_fulltext_pagos_referencia ON "Pago"
       USING gin(to_tsvector('spanish', referencia));`,

      // CuentaPorCobrar: observaciones (campo texto)
      `CREATE INDEX IF NOT EXISTS idx_fulltext_cuentasxcobrar_observaciones ON "CuentaPorCobrar"
       USING gin(to_tsvector('spanish', observaciones));`,
    ];

    for (const query of queries) {
      console.log(`➡️ Ejecutando: ${query}`);
      await sequelize.query(query);
    }

    console.log("✅ Todos los índices full-text han sido creados con éxito.");
  } catch (error) {
    console.error("❌ Error al agregar índices full-text:", error);
  } finally {
    await sequelize.close();
    console.log("✅ Conexión cerrada.");
  }
}

addFullTextIndexes();
