import sequelize from "../../../database/database.js";
import SearchRepository from "../../domain/repositories/SearchRepository.js";

class SequelizeSearchRepository extends SearchRepository {
  async generalSearch(query) {
    const searchQuery = `
          (
  SELECT id_producto::text AS id, nombre_producto AS nombre, 'productos' AS tipo, NULL::numeric AS total, NULL::timestamp AS fecha
  FROM "Producto"
  WHERE to_tsvector('spanish', nombre_producto) @@ plainto_tsquery('spanish', :query)
  LIMIT 5
)
UNION ALL
(
  SELECT id_insumo::text AS id, nombre_insumo AS nombre, 'insumos' AS tipo, NULL::numeric AS total, NULL::timestamp AS fecha
  FROM "Insumo"
  WHERE to_tsvector('spanish', nombre_insumo) @@ plainto_tsquery('spanish', :query)
  LIMIT 5
)
UNION ALL
(
  SELECT id_cliente::text AS id, nombre, 'clientes' AS tipo, NULL::numeric AS total, NULL::timestamp AS fecha
  FROM "Clientes"
  WHERE to_tsvector('spanish', nombre || ' ' || id_cliente) @@ plainto_tsquery('spanish', :query)
  LIMIT 5
)
UNION ALL
(
  SELECT id_camion::text AS id, placa AS nombre, 'camiones' AS tipo, NULL::numeric AS total, NULL::timestamp AS fecha
  FROM "Camion"
  WHERE to_tsvector('spanish', placa) @@ plainto_tsquery('spanish', :query)
  LIMIT 5
)
UNION ALL
(
  SELECT id_cotizacion::text AS id, COALESCE(notas, '') AS nombre, 'cotizaciones' AS tipo, total, fecha AS fecha
  FROM "Cotizacion"
  WHERE to_tsvector('spanish', COALESCE(notas, '')) @@ plainto_tsquery('spanish', :query)
  LIMIT 5
)
UNION ALL
(
  SELECT id_pago::text AS id, COALESCE(referencia, '') AS nombre, 'pagos' AS tipo, monto AS total, fecha_pago AS fecha
  FROM "Pago"
  WHERE to_tsvector('spanish', COALESCE(referencia, '')) @@ plainto_tsquery('spanish', :query)
  LIMIT 5
)
UNION ALL
(
  SELECT id_cxc::text AS id, COALESCE(observaciones, '') AS nombre, 'facturas' AS tipo, monto_total AS total, fecha_emision AS fecha
  FROM "CuentaPorCobrar"
  WHERE to_tsvector('spanish', COALESCE(observaciones, '')) @@ plainto_tsquery('spanish', :query)
  LIMIT 5
);
        `;

    return await sequelize.query(searchQuery, {
      replacements: { query },
      type: sequelize.QueryTypes.SELECT,
    });
  }

  async getPopularSuggestions() {
    const popularProductsQuery = `
      SELECT id_producto::text AS id, nombre_producto AS nombre, 'productos' AS tipo, NULL::numeric AS total, NULL::timestamp AS fecha
      FROM "Producto"
      LIMIT 5;
    `;

    const popularClientsQuery = `
      SELECT id_cliente::text AS id, nombre, 'clientes' AS tipo, NULL::numeric AS total, NULL::timestamp AS fecha
      FROM "Clientes"
      LIMIT 5;
    `;

    const popularInsumosQuery = `
      SELECT id_insumo::text AS id, nombre_insumo AS nombre, 'insumos' AS tipo, NULL::numeric AS total, NULL::timestamp AS fecha
      FROM "Insumo"
      LIMIT 5;
    `;

    const popularCotizacionesQuery = `
      SELECT c.id_cotizacion::text AS id, cli.nombre AS nombre, 'cotizaciones' AS tipo, c.total, c.fecha
      FROM "Cotizacion" c
      JOIN "Clientes" cli ON c.id_cliente = cli.id_cliente
      LIMIT 5;
    `;

    const popularPagosQuery = `
      SELECT p.id_pago::text AS id, cli.nombre AS nombre, 'pagos' AS tipo, p.monto AS total, p.fecha_pago AS fecha
      FROM "Pago" p
      JOIN "Venta" v ON p.id_venta = v.id_venta
      JOIN "Clientes" cli ON v.id_cliente = cli.id_cliente
      LIMIT 5;
    `;

    const popularCxCQuery = `
      SELECT cxc.id_cxc::text AS id, cli.nombre AS nombre, 'facturas' AS tipo, cxc.monto_total AS total, cxc.fecha_emision AS fecha
      FROM "CuentaPorCobrar" cxc
      JOIN "Venta" v ON cxc.id_venta = v.id_venta
      JOIN "Clientes" cli ON v.id_cliente = cli.id_cliente
      LIMIT 5;
    `;

    const popularCamionesQuery = `
      SELECT id_camion::text AS id, placa AS nombre, 'camiones' AS tipo, NULL::numeric AS total, NULL::timestamp AS fecha
      FROM "Camion"
      WHERE estado = 'Disponible'
      LIMIT 5;
    `;

    const [
      popularProducts,
      popularClients,
      popularInsumos,
      popularCotizaciones,
      popularPagos,
      popularCxC,
      popularCamiones,
    ] = await Promise.all([
      sequelize.query(popularProductsQuery, {
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(popularClientsQuery, {
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(popularInsumosQuery, {
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(popularCotizacionesQuery, {
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(popularPagosQuery, { type: sequelize.QueryTypes.SELECT }),
      sequelize.query(popularCxCQuery, { type: sequelize.QueryTypes.SELECT }),
      sequelize.query(popularCamionesQuery, {
        type: sequelize.QueryTypes.SELECT,
      }),
    ]);

    return [
      ...popularProducts,
      ...popularClients,
      ...popularInsumos,
      ...popularCotizaciones,
      ...popularPagos,
      ...popularCxC,
      ...popularCamiones,
    ];
  }

  async partialSearch(query) {
    const partialProductsQuery = `
      SELECT id_producto::text AS id, nombre_producto AS nombre, 'productos' AS tipo, NULL::numeric AS total, NULL::timestamp AS fecha
      FROM "Producto"
      WHERE nombre_producto ILIKE '%' || :query || '%'
      LIMIT 5;
    `;

    const partialInsumosQuery = `
      SELECT id_insumo::text AS id, nombre_insumo AS nombre, 'insumos' AS tipo, NULL::numeric AS total, NULL::timestamp AS fecha
      FROM "Insumo"
      WHERE nombre_insumo ILIKE '%' || :query || '%'
      LIMIT 5;
    `;

    const partialClientsQuery = `
      SELECT id_cliente::text AS id, nombre, 'clientes' AS tipo, NULL::numeric AS total, NULL::timestamp AS fecha
      FROM "Clientes"
      WHERE nombre ILIKE '%' || :query || '%'
      LIMIT 5;
    `;

    const partialCamionesQuery = `
      SELECT id_camion::text AS id, placa AS nombre, 'camiones' AS tipo, NULL::numeric AS total, NULL::timestamp AS fecha
      FROM "Camion"
      WHERE placa ILIKE '%' || :query || '%'
      LIMIT 5;
    `;

    const partialCotizacionesQuery = `
      SELECT c.id_cotizacion::text AS id, cli.nombre || ' - Cotización' AS nombre, 'cotizaciones' AS tipo, c.total, c.fecha
      FROM "Cotizacion" c
      JOIN "Clientes" cli ON c.id_cliente = cli.id_cliente
      WHERE cli.nombre ILIKE '%' || :query || '%' OR c.notas ILIKE '%' || :query || '%'
      LIMIT 5;
    `;

    const partialPagosQuery = `
      SELECT p.id_pago::text AS id, cli.nombre || ' - Pago' AS nombre, 'pagos' AS tipo, p.monto AS total, p.fecha_pago AS fecha
      FROM "Pago" p
      JOIN "Venta" v ON p.id_venta = v.id_venta
      JOIN "Clientes" cli ON v.id_cliente = cli.id_cliente
      WHERE cli.nombre ILIKE '%' || :query || '%' OR p.referencia ILIKE '%' || :query || '%'
      LIMIT 5;
    `;

    const partialCxCQuery = `
      SELECT cxc.id_cxc::text AS id, cli.nombre || ' - CxC' AS nombre, 'facturas' AS tipo, cxc.monto_total AS total, cxc.fecha_emision AS fecha
      FROM "CuentaPorCobrar" cxc
      JOIN "Venta" v ON cxc.id_venta = v.id_venta
      JOIN "Clientes" cli ON v.id_cliente = cli.id_cliente
      WHERE cli.nombre ILIKE '%' || :query || '%' OR cxc.observaciones ILIKE '%' || :query || '%'
      LIMIT 5;
    `;

    const [
      partialProducts,
      partialInsumos,
      partialClients,
      partialCamiones,
      partialCotizaciones,
      partialPagos,
      partialCxC,
    ] = await Promise.all([
      sequelize.query(partialProductsQuery, {
        replacements: { query },
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(partialInsumosQuery, {
        replacements: { query },
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(partialClientsQuery, {
        replacements: { query },
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(partialCamionesQuery, {
        replacements: { query },
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(partialCotizacionesQuery, {
        replacements: { query },
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(partialPagosQuery, {
        replacements: { query },
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(partialCxCQuery, {
        replacements: { query },
        type: sequelize.QueryTypes.SELECT,
      }),
    ]);

    return [
      ...partialProducts,
      ...partialInsumos,
      ...partialClients,
      ...partialCamiones,
      ...partialCotizaciones,
      ...partialPagos,
      ...partialCxC,
    ];
  }
}

export default SequelizeSearchRepository;
