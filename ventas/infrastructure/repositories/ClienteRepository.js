import SucursalRepository from "../../../auth/infraestructure/repositories/SucursalRepository.js";
import Cliente from "../../domain/models/Cliente.js";
import ClienteSucursal from "../../domain/models/ClienteSucursal.js";
import { Op } from "sequelize";

const SUCURSAL_ATTRIBUTES = ["id_sucursal", "nombre", "direccion", "telefono"];

function flattenSucursalIds(value) {
  if (value === undefined || value === null || value === "") return [];
  if (typeof value === "string" && value.trim() === "") return [];
  if (Array.isArray(value)) return value.flatMap(flattenSucursalIds);
  if (typeof value === "string" && value.includes(",")) {
    return value.split(",").flatMap(flattenSucursalIds);
  }
  if (typeof value === "object") {
    const id = value.id_sucursal ?? value.id ?? value.value;
    return id === undefined ? [id] : flattenSucursalIds(id);
  }
  return [typeof value === "string" ? value.trim() : value];
}

function normalizeSucursalIds(...values) {
  const ids = values.flatMap(flattenSucursalIds).map(Number);

  if (ids.some((id) => !Number.isFinite(id))) {
    throw new Error("id_sucursal inválido.");
  }

  return [...new Set(ids)];
}

function wasProvided(value) {
  return value !== undefined && value !== null;
}

class ClienteRepository {
  async findWithFilter(where) {
    return await Cliente.findAll({ where });
  }

  async findById(id_cliente, { id_sucursal, transaction } = {}) {
    const idSucursalRaw =
      typeof id_sucursal === "string" ? id_sucursal.trim() : id_sucursal;
    const idSucursal =
      idSucursalRaw !== undefined && idSucursalRaw !== ""
        ? Number(idSucursalRaw)
        : null;

    if (idSucursal !== null) {
      if (!Number.isFinite(idSucursal)) {
        throw new Error("id_sucursal inválido.");
      }

      const relation = await ClienteSucursal.findOne({
        where: { id_cliente, id_sucursal: idSucursal },
        attributes: ["id_cliente"],
        transaction,
      });

      if (!relation) return null;
    }

    return await Cliente.findByPk(id_cliente, {
      include: [
        {
          model: SucursalRepository.getModel(),
          as: "Sucursales",
          attributes: SUCURSAL_ATTRIBUTES,
          through: { attributes: [] },
        },
      ],
      transaction,
    });
  }

  async findByDireccion(direccion) {
    return await Cliente.findOne({ where: { direccion: direccion } });
  }

  async findAll() {
    return await Cliente.findAll();
  }

  async create(data, options = {}) {
    return await Cliente.create(data, options);
  }

  async update(id_cliente, data) {
    return await Cliente.update(data, { where: { id_cliente } });
  }

  async updateWithconditions(id, data, { transaction } = {}) {
    if (!id) throw new Error("Se requiere un ID de cliente para actualizar.");

    const cliente = await Cliente.findByPk(id, { transaction });
    if (!cliente) throw new Error(`Cliente con ID ${id} no encontrado.`);

    const {
      sucursalesIds,
      sucursalIds,
      sucursales_ids,
      sucursales,
      Sucursales,
      id_sucursal,
      ...campos
    } = data ?? {};

    const BLOCKED = new Set(["id_cliente", "fecha_registro", "creado_por"]);

    Object.entries(campos).forEach(([k, v]) => {
      if (v === undefined) return;
      if (BLOCKED.has(k)) return;
      if (Cliente.rawAttributes[k]) {
        cliente.set(k, v);
      }
    });

    await cliente.save({ transaction });

    const hasSucursalList = [
      sucursalesIds,
      sucursalIds,
      sucursales_ids,
      sucursales,
      Sucursales,
    ].some(wasProvided);

    if (hasSucursalList) {
      const ids = normalizeSucursalIds(
        sucursalesIds,
        sucursalIds,
        sucursales_ids,
        sucursales,
        Sucursales
      );
      const sucursales = await this.getSucursalesByIds(ids, transaction);
      await cliente.setSucursales(sucursales, { transaction });
    } else if (
      wasProvided(id_sucursal) &&
      id_sucursal !== null &&
      id_sucursal !== ""
    ) {
      const currentSucursales = await cliente.getSucursales({
        attributes: ["id_sucursal"],
        transaction,
      });
      const ids = normalizeSucursalIds(
        currentSucursales.map((sucursal) => sucursal.id_sucursal),
        id_sucursal
      );
      const sucursales = await this.getSucursalesByIds(ids, transaction);
      await cliente.setSucursales(sucursales, { transaction });
    }

    const updated = await Cliente.findByPk(id, {
      include: [
        {
          model: SucursalRepository.getModel(),
          as: "Sucursales",
          attributes: SUCURSAL_ATTRIBUTES,
          through: { attributes: [] },
        },
      ],
      transaction,
    });

    return updated;
  }

  async getSucursalesByIds(ids, transaction) {
    if (!ids.length) return [];

    const sucursales = await SucursalRepository.getModel().findAll({
      where: { id_sucursal: { [Op.in]: ids } },
      transaction,
    });
    const foundIds = new Set(
      sucursales.map((sucursal) => Number(sucursal.id_sucursal))
    );
    const missingIds = ids.filter((id) => !foundIds.has(id));

    if (missingIds.length) {
      throw new Error(`Sucursales no encontradas: ${missingIds.join(", ")}.`);
    }

    return sucursales;
  }

  async deactivate(id) {
    return await Cliente.update(
      { activo: false },
      { where: { id_cliente: id } }
    );
  }

  async reactivate(id) {
    return await Cliente.update(
      { activo: true },
      { where: { id_cliente: id } }
    );
  }

  async findByIds(ids) {
    return await Cliente.findAll({
      where: { id_cliente: ids },
    });
  }

  async getClientesRegistradosDesdeFecha(fechaInicio, fechaFin) {
    return await Cliente.count({
      where: {
        createdAt: {
          [Op.gte]: fechaInicio, // Mayor o igual que `fechaInicio`
          [Op.lt]: fechaFin, // Menor que `fechaFin`
        },
      },
    });
  }

  async getTotalClientes() {
    return await Cliente.count();
  }

  getModel() {
    return Cliente;
  }
}

export default new ClienteRepository();
