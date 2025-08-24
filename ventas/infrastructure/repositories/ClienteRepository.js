import SucursalRepository from "../../../auth/infraestructure/repositories/SucursalRepository.js";
import Cliente from "../../domain/models/Cliente.js";
import { Op } from "sequelize";

class ClienteRepository {
  async findWithFilter(where) {
    return await Cliente.findAll({ where });
  }

  async findById(id_cliente, { id_sucursal } = {}) {
    return await Cliente.findByPk(id_cliente, {
      include: [
        {
          model: SucursalRepository.getModel(),
          as: "Sucursales",
          attributes: ["id_sucursal", "nombre", "direccion", "telefono"],
          through: { attributes: [] },
          ...(id_sucursal
            ? { where: { id_sucursal: Number(id_sucursal) }, required: false }
            : {}),
        },
      ],
    });
  }

  async findByDireccion(direccion) {
    return await Cliente.findOne({ where: { direccion: direccion } });
  }

  async findAll() {
    return await Cliente.findAll();
  }

  async create(data) {
    return await Cliente.create(data);
  }

  async update(id_cliente, data) {
    return await Cliente.update(data, { where: { id_cliente } });
  }

  async updateWithconditions(id, data, { transaction } = {}) {
    if (!id) throw new Error("Se requiere un ID de cliente para actualizar.");

    const cliente = await Cliente.findByPk(id, { transaction });
    if (!cliente) throw new Error(`Cliente con ID ${id} no encontrado.`);

    const { sucursalesIds, ...campos } = data ?? {};

    const BLOCKED = new Set(["id_cliente", "fecha_registro", "creado_por"]);

    Object.entries(campos).forEach(([k, v]) => {
      if (v === undefined) return;
      if (BLOCKED.has(k)) return;
      if (Cliente.rawAttributes[k]) {
        cliente.set(k, v);
      }
    });

    await cliente.save({ transaction });

    if (Array.isArray(sucursalesIds)) {
      const ids = sucursalesIds.map(Number).filter(Number.isFinite);
      const sucursales = ids.length
        ? await SucursalRepository.getModel().findAll({
            where: { id_sucursal: { [Op.in]: ids } },
            transaction,
          })
        : [];
      await cliente.setSucursales(sucursales, { transaction });
    }

    const updated = await Cliente.findByPk(id, {
      include: [
        {
          model: SucursalRepository.getModel(),
          as: "Sucursales",
          attributes: ["id_sucursal", "nombre"],
          through: { attributes: [] },
        },
      ],
      transaction,
    });

    return updated;
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
