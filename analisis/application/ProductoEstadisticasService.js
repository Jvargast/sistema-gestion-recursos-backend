import { Op, fn, col } from "sequelize";
import DetalleVenta from "../../ventas/domain/models/DetalleVenta.js";
import ProductosEstadisticasRepository from "../infrastructure/repositories/ProductosEstadisticasRepository.js";
import Venta from "../../ventas/domain/models/Venta.js";

class ProductoEstadisticasService {
  async generarEstadisticasPorDia(fecha) {
    const inicioDia = new Date(fecha);
    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    const detalles = await DetalleVenta.findAll({
      include: [
        {
          model: Venta,
          as: "venta",
          where: {
            fecha: { [Op.between]: [inicioDia, finDia] },
          },
          attributes: [],
        },
      ],
      attributes: [
        "id_producto",
        [fn("SUM", col("cantidad")), "cantidad_vendida"],
        [fn("SUM", col("subtotal")), "monto_total"],
      ],
      group: ["id_producto"],
      raw: true,
    });

    const mes = inicioDia.getMonth() + 1;
    const anio = inicioDia.getFullYear();

    return await Promise.all(
      detalles.map((d) =>
        ProductosEstadisticasRepository.create({
          id_producto: d.id_producto,
          fecha: inicioDia,
          mes,
          anio,
          cantidad_vendida: parseInt(d.cantidad_vendida),
          monto_total: parseFloat(d.monto_total),
        })
      )
    );
  }

  async obtenerPorMesYAnio(mes, anio) {
    return await ProductoEstadisticasRepository.findAllByMesYAnio(mes, anio);
  }
}

export default new ProductoEstadisticasService();
