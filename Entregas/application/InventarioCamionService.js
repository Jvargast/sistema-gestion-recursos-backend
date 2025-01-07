import { Op } from "sequelize";
import InventarioService from "../../inventario/application/InventarioService.js";
import InventarioCamionRepository from "../infrastructure/repositories/InventarioCamionRepository.js";
import InventarioCamionLogsRepository from "../infrastructure/repositories/InventarioCamionLogsRepository.js";
import InventarioCamion from "../domain/models/InventarioCamion.js";
import Camion from "../domain/models/Camion.js";
import Producto from "../../inventario/domain/models/Producto.js";

class InventarioCamionService {
  async retornarProductosAdicionales(id_camion) {
    // Buscar todos los productos en estado "En Camión - Disponible"
    const productosCamion =
      await InventarioCamionRepository.findAllByCamionAndEstado(
        id_camion,
        "En Camión - Disponible"
      );

    // Iterar sobre cada producto y devolver al inventario principal
    for (const producto of productosCamion) {
      // Incrementar el stock del inventario principal
      await InventarioService.incrementStock(
        producto.id_producto,
        producto.cantidad
      );

      // Registrar el movimiento en los logs de inventario del camión
      await InventarioCamionLogsRepository.create({
        id_camion,
        id_producto: producto.id_producto,
        cantidad: producto.cantidad,
        estado: "Regresado", // Estado reflejando que fue devuelto
        fecha: new Date(),
      });

      // Eliminar el registro del producto del inventario del camión
      await InventarioCamionRepository.delete(producto.id_inventario_camion);
    }

    return {
      message: "Productos regresados al inventario principal.",
      productosDevueltos: productosCamion.map((p) => ({
        id_producto: p.id_producto,
        cantidad: p.cantidad,
      })),
    };
  }

  async addProductToCamion(data, esReservado = false) {
    const { id_camion, id_producto, cantidad, id_detalle_transaccion } = data;

    if (!id_camion || !id_producto || !cantidad) {
      throw new Error(
        "Faltan datos requeridos: id_camion, id_producto, cantidad"
      );
    }

    // Obtener capacidad del camión y su inventario
    const camion = await Camion.findByPk(id_camion, {
      include: [{ model: InventarioCamion, as: "inventario" }],
    });
    if (!camion) {
      throw new Error(`Camión con id ${id_camion} no encontrado`);
    }

    // Calcular la carga total actual del camión
    const cargaActual = camion.inventario.reduce(
      (sum, item) => sum + item.cantidad,
      0
    );
    if (cargaActual + cantidad > camion.capacidad) {
      throw new Error(
        `La carga excede la capacidad del camión. Capacidad máxima: ${camion.capacidad}, Carga actual: ${cargaActual}`
      );
    }

    // Verificar inventario principal
    const inventarioPrincipal =
      await InventarioService.getInventarioByProductoId(id_producto);
    if (!inventarioPrincipal || inventarioPrincipal.cantidad < cantidad) {
      throw new Error(
        `Stock insuficiente para el producto con id ${id_producto}.`
      );
    }

    // Registrar log de inventario antes de realizar cambios
    const estado = esReservado
      ? "En Camión - Reservado"
      : "En Camión - Disponible";
    await InventarioCamionLogsRepository.create({
      id_camion,
      id_producto,
      cantidad,
      estado,
      fecha: new Date(),
    });

    // Reducir inventario principal
    await InventarioService.decrementarStock(id_producto, cantidad);

    if (!esReservado) {
      // Actualizar la cantidad para productos "En Camión - Disponible"
      const inventarioDisponible = camion.inventario.find(
        (item) =>
          item.id_producto === id_producto &&
          item.estado === "En Camión - Disponible"
      );
      if (inventarioDisponible) {
        inventarioDisponible.cantidad += cantidad;
        await inventarioDisponible.save();
        return inventarioDisponible;
      }
    }

    // Crear un nuevo registro para productos "En Camión - Reservado" o cuando no existe en estado "Disponible"
    return await InventarioCamionRepository.create({
      id_camion,
      id_producto,
      cantidad,
      estado,
      id_detalle_transaccion: esReservado ? id_detalle_transaccion : null,
    });
  }

  async getProductsByCamion(id_camion) {
    return await InventarioCamionRepository.findByCamionId(id_camion);
  }

  async updateProductInCamion(id, data) {
    return await InventarioCamionRepository.update(id, data);
  }

  async updateProductState(id_camion, id_producto, nuevoEstado) {
    const producto = await InventarioCamionRepository.findOneProduct(
      id_camion,
      id_producto
    );

    if (producto) {
      await this.logInventarioMovimiento(
        id_camion,
        id_producto,
        producto.cantidad,
        producto.estado
      );
    }
    producto.estado = nuevoEstado;
    await producto.save();
  }

  async removeProductFromCamion(id) {
    const inventarioCamion = await InventarioCamionRepository.findById(id);
    if (!inventarioCamion) {
      throw new Error("InventarioCamion not found");
    }

    // Regresar el producto al inventario principal si no está vendido
    if (inventarioCamion.estado !== "Vendido") {
      await InventarioService.incrementStock(
        inventarioCamion.id_producto,
        inventarioCamion.cantidad
      );
    }

    return await InventarioCamionRepository.delete(id);
  }

  async getInventarioDisponible(id_camion, search = "") {
    if (!id_camion) {
      throw new Error("Se requiere el ID del camión.");
    }

    // Construir el filtro de búsqueda
    const searchFilter = search
      ? {
          [Op.or]: [
            { "$producto.nombre_producto$": { [Op.like]: `%${search}%` } },
            { "$producto.descripcion$": { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    // Obtener productos con estado "En Camión - Disponible"
    const inventario = await InventarioCamionRepository.findAllProducts({
      where: {
        id_camion,
        estado: "En Camión - Disponible",
        ...searchFilter,
      },
      include: [
        {
          model: Camion,
          as: "camion",
          attributes: ["placa", "estado"], // Información básica del camión
        },
        {
          model: Producto,
          as: "producto",
          attributes: [
            "id_producto",
            "nombre_producto",
            "descripcion",
            "precio",
          ],
        },
      ],
    });

    return inventario.map((item) => ({
      id_inventario_camion: item.id_inventario_camion,
      id_producto: item.producto.id_producto,
      precio: item.producto.precio,
      nombre_producto: item.producto.nombre_producto,
      descripcion: item.producto.descripcion,
      cantidad: item.cantidad,
      estado: item.estado,
      camion: {
        placa: item.camion.placa,
        estado: item.camion.estado,
      },
    }));
  }
}

export default new InventarioCamionService();
