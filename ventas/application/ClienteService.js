import { Op } from "sequelize";
import createFilter from "../../shared/utils/helpers.js";
import paginate from "../../shared/utils/pagination.js";
import ClienteRepository from "../infrastructure/repositories/ClienteRepository.js";
import moment from "moment/moment.js";
import { obtenerFechaActualChile } from "../../shared/utils/fechaUtils.js";
import SucursalRepository from "../../auth/infraestructure/repositories/SucursalRepository.js";
import sequelize from "../../database/database.js";
import ClienteSucursalRepository from "../infrastructure/repositories/ClienteSucursalRepository.js";

class ClienteService {
  async getClienteById(id, filters = {}) {
    const cliente = await ClienteRepository.findById(id, filters);
    if (!cliente) throw new Error("Cliente no encontrado.");
    return cliente;
  }

  async getAllClientes(filters = {}, options) {
    const allowedFields = [
      "id_cliente",
      "rut",
      "razon_social",
      "tipo_cliente",
      "nombre",
      "apellido",
      "direccion",
      "telefono",
      "email",
      "activo",
      "creado_por",
    ];
    const where = createFilter(filters, allowedFields);

    if (options.search) {
      where[Op.or] = [
        { rut: { [Op.like]: `%${options.search}%` } },
        { nombre: { [Op.like]: `%${options.search}%` } },
        { direccion: { [Op.like]: `%${options.search}%` } },
        { telefono: { [Op.like]: `%${options.search}%` } },
        { email: { [Op.like]: `%${options.search}%` } },
      ];
    }

    if (typeof filters.activo !== "undefined") {
      where.activo =
        String(filters.activo) === "true" || filters.activo === true;
    }

    if (typeof filters.creado_por !== "undefined") {
      where.creado_por = String(filters.creado_por);
    }

    const include = [
      {
        model: SucursalRepository.getModel(),
        as: "Sucursales",
        attributes: ["id_sucursal", "nombre"],
        through: { attributes: [] },
        ...(filters.id_sucursal
          ? {
              where: { id_sucursal: Number(filters.id_sucursal) },
              required: true,
            }
          : { required: false }),
      },
    ];

    const result = await paginate(ClienteRepository.getModel(), options, {
      where,
      include,
      order: [["fecha_registro", "ASC"]],
      distinct: true,
      subQuery: false,
    });
    return result;
  }

  async createCliente(data, rut) {
    const { nombre, direccion, telefono, id_sucursal } = data;

    if (!nombre || !direccion || !telefono) {
      throw new Error(
        "Faltan campos básicos: nombre, dirección y teléfono son obligatorios."
      );
    }

    const existingCliente = await ClienteRepository.findByDireccion(direccion);
    if (existingCliente) {
      throw new Error("Ya existe un cliente registrado con esta dirección.");
    }

    const t = await sequelize.transaction();
    try {
      const fecha_registro = obtenerFechaActualChile();

      const payload = {
        ...data,
        creado_por: rut ? String(rut).trim() : null,
        fecha_registro,
      };
      delete payload.id_sucursal; 

      const cliente = await ClienteRepository.create(payload, {
        transaction: t,
      });

      if (id_sucursal != null) {
        const idSuc = Number(id_sucursal);
        if (!Number.isFinite(idSuc)) {
          throw new Error("id_sucursal inválido.");
        }

        await ClienteSucursalRepository.getModel().findOrCreate({
          where: { id_cliente: cliente.id_cliente, id_sucursal: idSuc },
          defaults: { id_cliente: cliente.id_cliente, id_sucursal: idSuc },
          transaction: t,
        });
      }

      await t.commit();
      return cliente;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async updateCliente(id, data) {
    if (!id) throw new Error("Se requiere un ID de cliente para actualizar.");

    return await sequelize.transaction(async (t) => {
      return await ClienteRepository.updateWithconditions(id, data, {
        transaction: t,
      });
    });
  }

  async deactivateCliente(id) {
    const cliente = await ClienteRepository.findById(id);
    if (!cliente || !cliente.activo) {
      throw new Error("El cliente ya está desactivado o no existe.");
    }

    return await ClienteRepository.update(id, { activo: false });
  }

  async reactivateCliente(id) {
    const cliente = await ClienteRepository.findById(id);
    if (!cliente || cliente.activo) {
      throw new Error("El cliente ya está activo o no existe.");
    }

    return await ClienteRepository.update(id, { activo: true });
  }

  async searchClientes(filters) {
    const allowedFields = [
      "id_cliente",
      "rut",
      "nombre",
      "email",
      "tipo_cliente",
      "razon_social",
      "apellido",
      "telefono",
      "activo",
    ];
    const where = createFilter(filters, allowedFields);
    return await ClienteRepository.findWithFilter(where);
  }
  async deleteClientes(ids, id_usuario) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error(
        "Debe proporcionar al menos un ID de cliente para eliminar."
      );
    }
    const clientes = await ClienteRepository.findByIds(ids);

    if (clientes.length !== ids.length) {
      const notFoundIds = ids.filter(
        (id_cliente) =>
          !clientes.some((cliente) => cliente.id_cliente === id_cliente)
      );
      throw new Error(
        `Las siguientes clientes no fueron encontradas: ${notFoundIds.join(
          ", "
        )}`
      );
    }

    for (const cliente of clientes) {
      const activo = false;
      await ClienteRepository.update(cliente.id_cliente, { activo: activo });
    }

    return {
      message: `Se marcaron como eliminados ${ids.length} clientes.`,
    };
  }

  async calcularPorcentajeClientesNuevos() {
    try {
      // Calcular rango de fechas del mes pasado
      const mesPasado = moment()
        .subtract(1, "month")
        .startOf("month")
        .format("YYYY-MM-DD HH:mm:ss");
      const inicioMesActual = moment()
        .startOf("month")
        .format("YYYY-MM-DD HH:mm:ss");

      // Obtener la cantidad de clientes nuevos registrados desde el mes pasado
      const cantidadClientesNuevos =
        await ClienteRepository.getClientesRegistradosDesdeFecha(
          mesPasado,
          inicioMesActual
        );
      // Obtener el total de clientes
      const totalClientes = await ClienteRepository.getTotalClientes();

      if (totalClientes === 0) {
        return { porcentaje: 0, cantidad: 0 }; // Evitar división por cero
      }

      // Calcular el porcentaje de clientes nuevos
      const porcentajeNuevos = (cantidadClientesNuevos / totalClientes) * 100;

      return {
        porcentaje: porcentajeNuevos.toFixed(2), // Redondear a dos decimales
        cantidad: cantidadClientesNuevos,
      };
    } catch (error) {
      console.error(
        "Error en calcularPorcentajeYCantidadClientesNuevos:",
        error
      );
      throw error;
    }
  }
}

export default new ClienteService();
