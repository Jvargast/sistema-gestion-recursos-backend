"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Clientes: nombre + rut
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_fulltext_clientes_nombre_rut ON "Clientes"
      USING gin(to_tsvector('spanish', nombre || ' ' || rut));
    `);

    // Producto: nombre_producto
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_fulltext_productos_nombre ON "Producto"
      USING gin(to_tsvector('spanish', nombre_producto));
    `);

    // Insumo: nombre_insumo
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_fulltext_insumos_nombre ON "Insumo"
      USING gin(to_tsvector('spanish', nombre_insumo));
    `);

    // Camion: placa
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_fulltext_camiones_placa ON "Camion"
      USING gin(to_tsvector('spanish', placa));
    `);

    // Pedido: id_pedido + estado_pago + notas
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_fulltext_pedidos ON "Pedido"
      USING gin(to_tsvector('spanish', CAST(id_pedido AS TEXT) || ' ' || estado_pago || ' ' || COALESCE(notas, '')));
    `);

    // Venta: id_venta + tipo_entrega + notas
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_fulltext_ventas ON "Venta"
      USING gin(to_tsvector('spanish', CAST(id_venta AS TEXT) || ' ' || tipo_entrega || ' ' || COALESCE(notas, '')));
    `);

    // Cotizacion: id_cotizacion + estado + notas
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_fulltext_cotizaciones ON "Cotizacion"
      USING gin(to_tsvector('spanish', CAST(id_cotizacion AS TEXT) || ' ' || estado || ' ' || COALESCE(notas, '')));
    `);

    // Pago: id_pago + referencia
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_fulltext_pagos ON "Pago"
      USING gin(to_tsvector('spanish', CAST(id_pago AS TEXT) || ' ' || COALESCE(referencia, '')));
    `);

    // CuentaPorCobrar: id_cxc + estado + observaciones
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_fulltext_cuentasxcobrar ON "CuentaPorCobrar"
      USING gin(to_tsvector('spanish', CAST(id_cxc AS TEXT) || ' ' || estado || ' ' || COALESCE(observaciones, '')));
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_fulltext_clientes_nombre_rut;`
    );
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_fulltext_productos_nombre;`
    );
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_fulltext_insumos_nombre;`
    );
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_fulltext_camiones_placa;`
    );
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_fulltext_pedidos;`
    );
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_fulltext_ventas;`
    );
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_fulltext_cotizaciones;`
    );
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_fulltext_pagos;`
    );
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_fulltext_cuentasxcobrar;`
    );
  },
};
