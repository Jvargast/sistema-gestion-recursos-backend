import { Op } from "sequelize";
import sequelize from "../../database/database.js";
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

  async descargarItemsCamion(
    id_camion,
    { descargarRetorno = true, descargarDisponibles },
    transaction
  ) {
    const inventarioCamion = await InventarioCamionRepository.findAllByCamionId(
      id_camion,
      { transaction }
    );

    for (const item of inventarioCamion) {
      if (item.estado === "En Camión - Retorno" && descargarRetorno) {
        await ProductoRetornableRepository.create(
          {
            id_producto: item.id_producto || null,
            id_insumo: item.id_insumo || null,
            cantidad: item.cantidad,
            estado: "pendiente_inspeccion",
            fecha_retorno: new Date(),
            id_camion,
          },
          { transaction }
        );

        await item.destroy({ transaction });
      }
      if (item.estado === "En Camión - Disponible" && descargarDisponibles) {
        if (item.id_producto) {
          await InventarioService.incrementStock(
            item.id_producto,
            item.cantidad,
            { transaction }
          );
        }
        await item.destroy({ transaction });
      }
    }
  }

  async vaciarCamion(id_camion, options = {}) {
    const { descargarDisponibles = true, descargarRetorno = true } = options;
    const transaction = await sequelize.transaction();

    try {
      const inventarioCamion = await InventarioCamionRepository.findAllByCamionId(
        id_camion,
        { transaction }
      );

      const reservas = await InventarioCamionReservasRepository.findReservasByCamion(
        id_camion
      );

      for (const item of inventarioCamion) {
        if (item.estado === "En Camión - Disponible" && descargarDisponibles) {
          if (item.id_producto) {
            await InventarioService.incrementStock(
              item.id_producto,
              item.cantidad,
              { transaction }
            );
          }

          await InventarioCamionLogsRepository.create(
            {
              id_camion,
              id_producto: item.id_producto,
              id_insumo: item.id_insumo,
              cantidad: item.cantidad,
              tipo_movimiento: "Descarga camión",
              estado: "Regresado",
              fecha: new Date(),
            },
            { transaction }
          );

          await item.destroy({ transaction });
          continue;
        }

        if (item.estado === "En Camión - Retorno" && descargarRetorno) {
          await ProductoRetornableRepository.create(
            {
              id_producto: item.id_producto || null,
              id_insumo: item.id_insumo || null,
              cantidad: item.cantidad,
              estado: "pendiente_inspeccion",
              fecha_retorno: new Date(),
              id_camion,
            },
            { transaction }
          );

          await InventarioCamionLogsRepository.create(
            {
              id_camion,
              id_producto: item.id_producto,
              id_insumo: item.id_insumo,
              cantidad: item.cantidad,
              tipo_movimiento: "Descarga camión",
              estado: "Retorno",
              fecha: new Date(),
            },
            { transaction }
          );

          await item.destroy({ transaction });
          continue;
        }

        if (item.estado === "En Camión - Reservado") {
          const relacionadas = reservas.filter(
            (r) => r.id_inventario_camion === item.id_inventario_camion
          );
          for (const reserva of relacionadas) {
            await InventarioCamionReservasRepository.update(
              reserva.id_reserva,
              { estado: "Cancelado" },
              transaction
            );
          }

          if (item.id_producto) {
            await InventarioService.incrementStock(
              item.id_producto,
              item.cantidad,
              { transaction }
            );
          }

          await InventarioCamionLogsRepository.create(
            {
              id_camion,
              id_producto: item.id_producto,
              id_insumo: item.id_insumo,
              cantidad: item.cantidad,
              tipo_movimiento: "Descarga camión",
              estado: "Reservado",
              fecha: new Date(),
            },
            { transaction }
          );

          await item.destroy({ transaction });
        }
      }

      await transaction.commit();

      return { message: "Camión vaciado correctamente" };
    } catch (error) {
      if (transaction.finished !== "commit") {
        await transaction.rollback();
      }
      throw error;
    }
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

    id_camion = parseInt(id_camion);

    const whereClause = {
      id_camion: parseInt(id_camion),
      estado: "En Camión - Disponible",
    };

    if (search) {
      whereClause[Op.or] = [
        { "$producto.nombre_producto$": { [Op.like]: `%${search}%` } },
        { "$producto.descripcion$": { [Op.like]: `%${search}%` } },
      ];
    }

    const inventario = await InventarioCamionRepository.findAllProducts({
      where: whereClause,
      include: [
        {
          model: ProductosRepository.getModel(),
          as: "producto",
          attributes: [
            "id_producto",
            "nombre_producto",
            "descripcion",
            "precio",
            "es_retornable",
          ],
        },
      ],
    });

    return inventario.map((item) => ({
      id_inventario_camion: item.id_inventario_camion,
      id_producto: item.producto.id_producto,
      nombre_producto: item.producto.nombre_producto,
      descripcion: item.producto.descripcion,
      cantidad: item.cantidad,
      estado: item.estado,
      precio: item.producto.precio,
      es_retornable: item.es_retornable,
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

    // Obtener el inventario del camión desde el repositorio
    const inventario = await InventarioCamionRepository.findByCamionId(
      id_camion
    );

    // Si el camión no tiene productos registrados, toda la capacidad está vacía y disponible es 0.
    if (!inventario || inventario.length === 0) {
      return {
        id_camion,
        capacidad_total: camion.capacidad,
        disponibles: 0,
        reservados_retornables: 0,
        reservados_no_retornables: 0,
        retorno: 0,
        vacios: camion.capacidad,
      };
    }

    let reservados_retornables = 0;
    let reservados_no_retornables = 0;
    let disponibles = 0;
    let retorno = 0;

    for (const item of inventario) {
      switch (item.estado) {
        case "En Camión - Reservado":
          if (item.es_retornable) reservados_retornables += item.cantidad;
          else reservados_no_retornables += item.cantidad;
          break;
        case "En Camión - Reservado - Entrega":
          reservados_no_retornables += item.cantidad;
          break;
        case "En Camión - Disponible":
          disponibles += item.cantidad;
          break;
        case "En Camión - Retorno":
          retorno += item.cantidad;
          break;
      }
    }

    // La cantidad de espacios vacíos ahora se calcula correctamente:
    const vacios = Math.max(
      camion.capacidad - (reservados_retornables + disponibles + retorno),
      0
    );

    return {
      id_camion,
      capacidad_total: camion.capacidad,
      disponibles,
      reservados_retornables,
      reservados_no_retornables,
      retorno,
      vacios,
    };
  }

  async getProductoEnCamion(id_camion, id_producto) {
    return await InventarioCamionRepository.findOneProduct(
      id_camion,
      id_producto
    );
  }

  async getInventarioByCamion(id_camion, { transaction } = {}) {
    try {
      if (!id_camion) {
        throw new Error("Se requiere el ID del camión.");
      }
      const inventario = await InventarioCamionRepository.findAllByCamionId(
        id_camion,
        { transaction }
      );

      return inventario;
    } catch (error) {
      throw error;
    }
  }

  async retirarProductoDelCamion(
    id_camion,
    id_producto,
    cantidad,
    estado,
    transaction
  ) {
    try {
      const productoEnCamion =
        await InventarioCamionRepository.findByCamionAndProduct(
          id_camion,
          id_producto,
          estado,
          transaction
        );

      if (!productoEnCamion) {
        throw new Error(
          `🔴 El producto ID ${id_producto} en estado "${estado}" no está en el camión.`
        );
      }

      if (typeof productoEnCamion.cantidad !== "number") {
        throw new Error(
          `🔴 Error de datos: La cantidad disponible para el producto ID ${id_producto} es inválida.`
        );
      }

      if (cantidad > productoEnCamion.cantidad) {
        throw new Error(
          `⚠️ Cantidad a retirar mayor que la disponible (Disponible: ${productoEnCamion.cantidad}, Intentando retirar: ${cantidad}).`
        );
      }

      // Actualizar cantidad
      productoEnCamion.cantidad -= cantidad;

      if (productoEnCamion.cantidad === 0) {
        await InventarioCamionRepository.deleteProductInCamion(
          id_camion,
          id_producto,
          estado,
          { transaction }
        );
      } else {
        if (!productoEnCamion.save) {
          throw new Error(
            `🔴 El objeto productoEnCamion no es una instancia válida de Sequelize.`
          );
        }
        await productoEnCamion.save({ transaction });
      }

      // Registrar movimiento de regreso
      await InventarioCamionLogsRepository.create(
        {
          id_camion,
          id_producto,
          cantidad,
          tipo_movimiento: "Regreso de inventario",
          estado: "Regresado",
          fecha: new Date(),
        },
        { transaction }
      );
    } catch (error) {
      console.error("Error en retirarProductoDelCamion:", error.message);
      throw error;
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
          id_camion,
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

  async addOrUpdateProductoCamion(
    {
      id_camion,
      id_producto,
      id_insumo,
      cantidad,
      estado,
      tipo,
      es_retornable,
    },
    options = {}
  ) {
    const { transaction } = options;

    try {
      let itemEnCamion = null;

      if (id_producto) {
        itemEnCamion = await InventarioCamionRepository.findByCamionAndProduct(
          id_camion,
          id_producto,
          estado,
          { transaction }
        );
      } else if (id_insumo) {
        itemEnCamion = await InventarioCamionRepository.findByCamionAndInsumo(
          id_camion,
          id_insumo,
          estado,
          { transaction }
        );
      }

      if (itemEnCamion) {
        itemEnCamion.cantidad += cantidad;
        itemEnCamion.fecha_actualizacion = new Date();
        await itemEnCamion.save({ transaction });
        return itemEnCamion;
      } else {
        const nuevoItem = await InventarioCamionRepository.create(
          {
            id_camion,
            id_producto,
            id_insumo,
            cantidad,
            estado,
            tipo,
            es_retornable,
            fecha_actualizacion: new Date(),
          },
          { transaction }
        );
        return nuevoItem;
      }
    } catch (error) {
      console.error("Error en addOrUpdateProductoCamion:", error);
      throw error;
    }
  }

  async reservarDesdeDisponible({
    id_camion,
    id_producto,
    cantidad,
    tipo = "Reservado",
    es_retornable = false,
    transaction,
  }) {
    const estadoDisponible = "En Camión - Disponible";
    const estadoReservado = "En Camión - Reservado";

    const disponible = await InventarioCamionRepository.findByCamionAndProduct(
      id_camion,
      id_producto,
      estadoDisponible,
      { transaction }
    );

    if (!disponible || disponible.cantidad < cantidad) {
      throw new Error("Inventario disponible insuficiente");
    }

    // 1. Resta del disponible
    disponible.cantidad -= cantidad;
    await disponible.save({ transaction });

    // 2. Suma al reservado
    await this.addOrUpdateProductoCamion(
      {
        id_camion,
        id_producto,
        cantidad,
        estado: estadoReservado,
        tipo,
        es_retornable,
      },
      { transaction }
    );
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
