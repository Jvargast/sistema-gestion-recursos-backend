import { Op } from "sequelize";
import sequelize from "../../database/database.js";
import BoletaRepository from "../../ventas/infrastructure/repositories/BoletaRepository.js";
import ClienteRepository from "../../ventas/infrastructure/repositories/ClienteRepository.js";
import DocumentoRepository from "../../ventas/infrastructure/repositories/DocumentoRepository.js";
import PagoRepository from "../../ventas/infrastructure/repositories/PagoRepository.js";
import DetallesVentaChoferRepository from "../infrastructure/repositories/DetallesVentaChoferRepository.js";
import HistorialVentasChoferRepository from "../infrastructure/repositories/HistorialVentasChoferRepository.js";
import InventarioCamionLogsRepository from "../infrastructure/repositories/InventarioCamionLogsRepository.js";
import InventarioCamionRepository from "../infrastructure/repositories/InventarioCamionRepository.js";
import VentasChoferRepository from "../infrastructure/repositories/VentasChoferRepository.js";
import CamionRepository from "../infrastructure/repositories/CamionRepository.js";
import MetodoPagoRepository from "../../ventas/infrastructure/repositories/MetodoPagoRepository.js";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import AgendaCargaRepository from "../infrastructure/repositories/AgendaCargaRepository.js";
import ProductosRepository from "../../inventario/infrastructure/repositories/ProductosRepository.js";

class VentaChoferService {
  async realizarVentaRapida(
    id_camion,
    cliente_rut,
    productos,
    metodo_pago,
    monto,
    referencia,
    rut
  ) {
    let transaction;
  
    try {
      // Inicia una única transacción
      transaction = await sequelize.transaction();
  
      // Validar cliente
      const cliente = await ClienteRepository.findById(cliente_rut);
      if (!cliente) {
        throw new Error(`Cliente con RUT ${cliente_rut} no encontrado.`);
      }
  
      // Validar que el camión esté asociado a una agenda en tránsito
      const agenda = await AgendaCargaRepository.findByCamionAndEstado(
        id_camion,
        "En tránsito"
      );
      if (!agenda) {
        throw new Error(
          `El camión con ID ${id_camion} no está asociado a una agenda en tránsito.`
        );
      }
  
      // Obtener precios desde la base de datos
      const productIds = productos.map((p) => p.id_producto);
      const productPrices = await ProductosRepository.findByIds(productIds);
  
      if (!productPrices || productPrices.length !== productos.length) {
        throw new Error(
          "No se pudieron obtener los precios de todos los productos solicitados."
        );
      }
  
      // Crear un mapa de precios para facilitar la búsqueda
      const priceMap = productPrices.reduce((acc, product) => {
        acc[product.id_producto] = product.precio; // Asegúrate de que "precio" es el campo correcto en la tabla
        return acc;
      }, {});
  
      let totalVenta = 0;
  
      for (const producto of productos) {
        const inventario =
          await InventarioCamionRepository.findByCamionProductoAndEstado(
            id_camion,
            producto.id_producto,
            "En Camión - Disponible"
          );
  
        if (!inventario || inventario.cantidad < producto.cantidad) {
          throw new Error(
            `Stock insuficiente para el producto con ID ${producto.id_producto}.`
          );
        }
  
        // Asegurarse de que el producto tenga un precio en el mapa
        const precioUnitario = priceMap[producto.id_producto];
        if (!precioUnitario) {
          throw new Error(
            `El producto con ID ${producto.id_producto} no tiene un precio definido.`
          );
        }
  
        // Usar el precio obtenido de la base de datos
        producto.precioUnitario = precioUnitario;
  
        totalVenta += producto.cantidad * precioUnitario;
      }
  
      // Validar que el monto proporcionado coincida con el total calculado
      if (monto !== totalVenta) {
        throw new Error(
          `El monto proporcionado (${monto}) no coincide con el total calculado (${totalVenta}).`
        );
      }
  
      // Crear la venta con el total calculado
      const venta = await VentasChoferRepository.create(
        {
          id_camion,
          id_cliente: cliente.rut,
          id_chofer: rut,
          id_metodo_pago: metodo_pago,
          total_venta: totalVenta,
          estadoPago: "pagado",
          fechaHoraVenta: new Date(),
        },
        { transaction }
      );
  
      if (!venta || !venta.id_venta_chofer) {
        throw new Error("Error al crear la venta. El ID no se generó.");
      }
  
      // Procesar los productos
      for (const producto of productos) {
        const inventario =
          await InventarioCamionRepository.findByCamionProductoAndEstado(
            id_camion,
            producto.id_producto,
            "En Camión - Disponible"
          );
  
        const nuevaCantidad = inventario.cantidad - producto.cantidad;
  
        // Crear el detalle de la venta
        await DetallesVentaChoferRepository.create(
          {
            id_venta_chofer: venta.id_venta_chofer,
            id_inventario_camion: inventario.id_inventario_camion,
            cantidad: producto.cantidad,
            precioUnitario: producto.precioUnitario, // Usar el precio de la base de datos
          },
          { transaction }
        );
  
        // Actualizar inventario
        if (nuevaCantidad === 0) {
          await InventarioCamionRepository.delete(
            inventario.id_inventario_camion,
            { transaction }
          );
        } else {
          await InventarioCamionRepository.updateById(
            inventario.id_inventario_camion,
            { cantidad: nuevaCantidad },
            { transaction }
          );
        }
  
        // Registrar en logs
        await InventarioCamionLogsRepository.create(
          {
            id_camion,
            id_producto: producto.id_producto,
            cantidad: producto.cantidad,
            estado: "Vendido",
            fecha: new Date(),
          },
          { transaction }
        );
      }
  
      // Crear el documento
      const documento = await DocumentoRepository.create(
        {
          id_venta_chofer: venta.id_venta_chofer,
          id_cliente: cliente.rut,
          tipo_documento: "boleta",
          id_estado_pago: 2,
          fecha_emision: new Date(),
          total: totalVenta,
          monto_pagado: totalVenta,
        },
        { transaction }
      );
  
      // Crear la boleta
      const boleta = await BoletaRepository.create(
        {
          id_documento: documento.id_documento,
        },
        { transaction }
      );
  
      // Registrar el pago
      await PagoRepository.create(
        {
          id_documento: documento.id_documento,
          tipo_documento: "boleta",
          id_metodo_pago: metodo_pago,
          monto: totalVenta,
          fecha: new Date(),
          referencia,
        },
        { transaction }
      );
  
      // Registrar historial de la venta
      await HistorialVentasChoferRepository.create(
        {
          id_venta_chofer: venta.id_venta_chofer,
          id_chofer: rut,
          fechaSincronizacion: new Date(),
          estadoSincronizacion: "sincronizado",
        },
        { transaction }
      );
  
      // Confirmar transacción
      await transaction.commit();
  
      return {
        message: "Venta rápida registrada con éxito",
        venta,
        documento,
        boleta,
      };
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw new Error(`Error en la venta rápida: ${error.message}`);
    }
  }

  async getVentasChofer(filters = {}, options) {
    const allowedFields = [
      "id_cliente",
      "id_camion",
      "fechaHoraVenta",
      "total_venta",
      "estadoPago",
      "id_chofer",
    ];

    const where = createFilter(filters, allowedFields);

    // Incluir búsqueda global si `search` está presente
    if (options.search) {
      where[Op.or] = [
        { "$cliente.nombre$": { [Op.like]: `%${options.search}%` } }, // Buscar en cliente.nombre
        { "$camion.placa$": { [Op.like]: `%${options.search}%` } }, // Buscar en camion.nombre
        { "$metodoPago.nombre$": { [Op.like]: `%${options.search}%` } }, // Buscar en metodoPago.nombre
      ];
    }

    // Configurar asociaciones
    const include = [
      {
        model: ClienteRepository.getModel(),
        as: "cliente",
        attributes: ["rut", "nombre", "email"],
      },
      {
        model: CamionRepository.getModel(),
        as: "camion",
        attributes: ["placa", "estado"],
      },
      {
        model: MetodoPagoRepository.getModel(),
        as: "metodoPago",
        attributes: ["nombre"],
      },
    ];

    // Ejecutar la consulta con paginación
    const result = await paginate(VentasChoferRepository.getModel(), options, {
      where,
      include,
      order: [["fechaHoraVenta", "DESC"]],
    });

    return result;
  }
}

export default new VentaChoferService();
