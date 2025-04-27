

export const estadosValidosVenta = [
  3, // Pagada
  5, // Confirmado
  7, // En Preparación
  8, // En Entrega
  9, // Completada
  13, // Completada y Entregada
];

export const estadosValidosPedido = [
  5, // Confirmado
  7, // En Preparación
  8, // En Entrega
  9, // Completada
  13, // Completada y Entregada
];

export const estadosInvalidosVenta = [
  6, // Rechazado
  10, // Cancelada
  11, // Reembolsada
  12, // Rechazada (duplicado)
];

export const estadosInvalidosPedido = [
  6, // Rechazado
  10, // Cancelada
  12, // Rechazada (duplicado)
];


import { Op } from "sequelize";

export const filtroVentasValidas = () => ({
  id_estado_venta: { [Op.in]: estadosValidosVenta },
});

export const filtroPedidosValidos = () => ({
  id_estado_venta: { [Op.in]: estadosValidosPedido },
});

export const filtroVentasInvalidas = () => ({
  id_estado_venta: { [Op.in]: estadosInvalidosVenta },
});

export const filtroPedidosInvalidos = () => ({
  id_estado_venta: { [Op.in]: estadosInvalidosPedido },
});

// utils/estadoUtils.js

export function getWhereEstadoVentaValido() {
  return {
    id_estado_venta: {
      [Op.notIn]: estadosInvalidosVenta,
    },
  };
}
