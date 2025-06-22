import { Op } from "sequelize";

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

export function getWhereEstadoVentaValido() {
  return {
    id_estado_venta: {
      [Op.notIn]: estadosInvalidosVenta,
    },
  };
}
