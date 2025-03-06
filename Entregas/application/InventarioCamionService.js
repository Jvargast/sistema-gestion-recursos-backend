import { Op } from "sequelize";
import InventarioService from "../../inventario/application/InventarioService.js";
import InventarioCamionRepository from "../infrastructure/repositories/InventarioCamionRepository.js";
import InventarioCamionLogsRepository from "../infrastructure/repositories/InventarioCamionLogsRepository.js";
import ProductosRepository from "../../inventario/infrastructure/repositories/ProductosRepository.js";
import InventarioCamionReservasRepository from "../infrastructure/repositories/InventarioCamionReservasRepository.js";
import CamionRepository from "../infrastructure/repositories/CamionRepository.js";
import ProductoRetornableRepository from "../../inventario/infrastructure/repositories/ProductoRetornableRepository.js";

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

  async addProductToCamion(data) {
    const { id_camion, id_producto, cantidad, tipo } = data;

    const producto = await ProductosRepository.findById(id_producto);
    if (!producto) throw new Error("Producto no encontrado.");

    const esRetornable = producto.es_retornable ?? false;

    await InventarioCamionRepository.create({
      id_camion,
      id_producto,
      cantidad,
      estado:
        tipo === "Reservado"
          ? "En Camión - Reservado"
          : "En Camión - Disponible",
      tipo: tipo,
      es_retornable: esRetornable,
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
    // Validar que id_camion es un número entero
    if (!id_camion || isNaN(parseInt(id_camion))) {
      throw new Error("Se requiere un ID de camión válido.");
    }

    id_camion = parseInt(id_camion); // Convertir a número para evitar errores

    // Construir el filtro de búsqueda
    const searchFilter = search
      ? {
          [Op.or]: [
            { "$producto.nombre_producto$": { [Op.like]: `%${search}%` } },
            { "$producto.descripcion$": { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    // Obtener productos disponibles y reservados en el camión
    const inventario = await InventarioCamionRepository.findAllProducts({
      where: {
        id_camion,
        estado: {
          [Op.in]: ["En Camión - Disponible", "En Camión - Reservado"],
        },
        ...searchFilter,
      },
      include: [
        {
          model: Camion,
          as: "Camion",
          attributes: ["placa", "estado"],
        },
        {
          model: ProductosRepository.getModel(),
          as: "producto",
          attributes: [
            "id_producto",
            "nombre_producto",
            "descripcion",
            "precio",
          ],
        },
        {
          model: InventarioCamionReservasRepository.getModel(),
          as: "reservas",
          attributes: ["id_pedido", "cantidad_reservada"],
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
      cantidad_reservada: item.reservas
        ? item.reservas.reduce((sum, res) => sum + res.cantidad_reservada, 0)
        : 0,
      camion: {
        placa: item.camion.placa,
        estado: item.camion.estado,
      },
    }));
  }

  async getEstadoInventario(id_camion) {
    if (!id_camion || isNaN(parseInt(id_camion))) {
      throw new Error("Se requiere un ID de camión válido.");
    }

    id_camion = parseInt(id_camion);

    // Obtener la capacidad total del camión
    const camion = await CamionRepository.findById(id_camion);
    if (!camion) {
      throw new Error(`Camión con id ${id_camion} no encontrado.`);
    }

    // Obtener inventario del camión desde el repositorio
    const inventario = await InventarioCamionRepository.findByCamionId(
      id_camion
    );

    // Caso 1: El camión no tiene productos cargados aún (capacidad total disponible)
    if (!inventario || inventario.length === 0) {
      return {
        id_camion,
        capacidad_total: camion.capacidad,
        en_uso: 0,
        disponible: camion.capacidad,
      };
    }

    // Caso 2: Calcular productos "En Uso" y "Disponibles"
    let enUso = 0;
    let disponible = 0;

    for (const item of inventario) {
      if (item.estado === "En Camión - Reservado") {
        enUso += item.cantidad;
      } else if (item.estado === "En Camión - Disponible") {
        disponible += item.cantidad;
      }
    }

    // Ajuste para evitar valores negativos en caso de sobrecarga
    const capacidadRestante = camion.capacidad - enUso - disponible;
    if (capacidadRestante < 0) {
      disponible = Math.max(0, disponible + capacidadRestante);
    }

    return {
      id_camion,
      capacidad_total: camion.capacidad,
      en_uso: enUso,
      disponible,
    };
  }

  async getProductoEnCamion(id_camion, id_producto) {
    return await InventarioCamionRepository.findOneProduct(
      id_camion,
      id_producto
    );
  }

  async getInventarioByCamion(id_camion) {
    try {
      if (!id_camion) {
        throw new Error("Se requiere el ID del camión.");
      }
      const inventario = await InventarioCamionRepository.findAllByCamionId(
        id_camion
      );
      return inventario.map((item) => ({
        id_inventario_camion: item.id_inventario_camion,
        id_producto: item.producto.id_producto,
        nombre_producto: item.producto.nombre_producto,
        cantidad: item.cantidad,
        estado: item.estado, // "Disponible" o "Reservado"
      }));
    } catch (error) {
      return error;
    }
  }

  async retirarProductoDelCamion(id_camion, id_producto, cantidad) {
    const productoEnCamion =
      await InventarioCamionRepository.findByCamionAndProduct(
        id_camion,
        id_producto
      );
    if (!productoEnCamion) throw new Error("El producto no está en el camión.");

    if (cantidad > productoEnCamion.cantidad) {
      throw new Error(
        "Cantidad a retirar mayor que la disponible en el camión."
      );
    }

    const producto = await ProductosRepository.findById(id_producto);
    if (!producto) throw new Error("Producto no encontrado.");

    if (producto.es_retornable) {
      // Si es retornable, lo marcamos en `ProductoRetornable`
      await this.registrarRetornables(id_camion, [
        { id_producto, cantidad, estado: "reutilizable" },
      ]);
    } else {
      // Si no es retornable, solo descontamos del camión
      await InventarioCamionRepository.update(
        { cantidad: productoEnCamion.cantidad - cantidad, estado: "Regresado" },
        { where: { id_camion, id_producto }, transaction }
      );

      if (productoEnCamion.cantidad - cantidad === 0) {
        await InventarioCamionRepository.deleteProductInCamion(
          id_camion,
          id_producto
        );
      }
    }
  }

  async registrarRetornables(id_camion, retornables) {
    for (const retorno of retornables) {
      const { id_producto, cantidad, estado, tipo_defecto } = retorno;

      if (estado === "reutilizable") {
        // Agregar los retornables al inventario de bodega
        await InventarioService.incrementStock(id_producto, cantidad);
      } else {
        // Registrar los retornables defectuosos
        await ProductoRetornableRepository.create({
          id_producto,
          cantidad,
          estado: "defectuoso",
          tipo_defecto,
          fecha_retorno: new Date(),
        });
      }

      // Eliminar de InventarioCamion
      await InventarioCamionRepository.deleteProductInCamion(
        id_camion,
        id_producto
      );
    }
  }

  async actualizarProductoEnCamion(id_camion, id_producto, cantidad) {
    const productoEnCamion = await this.getProductoEnCamion(
      id_camion,
      id_producto
    );

    if (!productoEnCamion) {
      throw new Error(
        `El producto con ID ${id_producto} no está en el camión.`
      );
    }

    // Actualizar cantidad
    await InventarioCamionRepository.updateCantidad(
      id_camion,
      id_producto,
      productoEnCamion.cantidad + cantidad
    );
    return await this.getProductoEnCamion(id_camion, id_producto);
  }

  async getInventarioPorChofer(id_chofer) {
    if (!id_chofer) {
      throw new Error("Se requiere un ID de chofer válido.");
    }

    // Obtener el camión asignado al chofer
    const camion = await CamionRepository.findByChoferId(id_chofer);
    if (!camion) {
      throw new Error(
        `No se encontró un camión asignado al chofer con id ${id_chofer}.`
      );
    }

    // Obtener el inventario del camión
    return await InventarioCamionRepository.findByCamionId(camion.id_camion);
  }
}

export default new InventarioCamionService();
