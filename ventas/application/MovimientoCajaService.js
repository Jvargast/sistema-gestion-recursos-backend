import { Op } from "sequelize";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import CajaRepository from "../infrastructure/repositories/CajaRepository.js";
import MovimientoCajaRepository from "../infrastructure/repositories/MovimientoCajaRepository.js";
class MovimientoCajaService {
  async getAllMovimientos(filters, options) {
    const allowedFields = [
      "id_movimiento",
      "fecha_movimiento",
    ];
    const where = createFilter(filters, allowedFields);

    if (filters.fecha_movimiento) {
      where.fecha_movimiento = {
        [Op.between]: [
          `${filters.fecha_movimiento} 00:00:00`,
          `${filters.fecha_movimiento} 23:59:59`,
        ],
      };
    }

    const result = await paginate(
      MovimientoCajaRepository.getModel(),
      options,
      {
        where,
        order: [["id_movimiento", "ASC"]],
      }
    );

    return result;
  }
  async getMovimientosByCajaAndDate(id_caja, fecha, page, limit) {
    if (!id_caja) {
      throw new Error("El ID de la caja es requerido.");
    }
    if (!fecha) {
      throw new Error("La fecha es requerida.");
    }

    const offset = (page - 1) * limit;

    const movimientos = await MovimientoCajaRepository.findByCajaIdAndDate(
      id_caja,
      fecha,
      limit,
      offset
    );

    const totalMovimientos =
      await MovimientoCajaRepository.countByCajaIdAndDate(id_caja, fecha);

    return {
      data: movimientos,
      pagination: {
        totalItems: totalMovimientos,
        totalPages: Math.ceil(totalMovimientos / limit),
        currentPage: page,
        pageSize: limit,
      },
    };
  }
  async registrarMovimiento({
    id_caja,
    tipo_movimiento,
    monto,
    descripcion,
    id_venta,
    id_metodo_pago,
  }) {
    // Validar tipo de movimiento
    if (!["ingreso", "egreso"].includes(tipo_movimiento)) {
      throw new Error(
        "Tipo de movimiento no válido. Debe ser 'ingreso' o 'egreso'."
      );
    }

    // Validar monto positivo
    if (monto <= 0) {
      throw new Error("El monto debe ser un valor positivo.");
    }

    // Obtener la caja
    const caja = await CajaRepository.findById(id_caja);
    if (!caja) {
      throw new Error(`Caja con ID ${id_caja} no encontrada.`);
    }

    // Verificar el saldo inicial/final de la caja
    const saldo_actual =
      caja.saldo_final !== null ? caja.saldo_final : caja.saldo_inicial;

    // Calcular el nuevo saldo basado en el tipo de movimiento
    let nuevoSaldo;
    if (tipo_movimiento === "ingreso") {
      nuevoSaldo = Number(saldo_actual) + Number(monto);
    } else if (tipo_movimiento === "egreso") {
      nuevoSaldo = Number(saldo_actual) - Number(monto);
    }

    // Registrar movimiento
    const movimiento = await MovimientoCajaRepository.create({
      id_caja,
      tipo_movimiento,
      monto,
      descripcion,
      fecha_movimiento: new Date(),
      id_venta,
      id_metodo_pago,
      saldo_caja: nuevoSaldo,
    });

    // Actualizar saldo final en la caja
    await CajaRepository.update(id_caja, { saldo_final: nuevoSaldo });

    return movimiento;
  }
}

export default new MovimientoCajaService();
