import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import Cliente from "../../../ventas/domain/models/Cliente.js";
import DetalleTransaccion from "../../../ventas/domain/models/DetalleTransaccion.js";
import Transaccion from "../../../ventas/domain/models/Transaccion.js";
import AgendaCarga from "../../domain/models/AgendaCarga.js";
import Camion from "../../domain/models/Camion.js";
import InventarioCamion from "../../domain/models/InventarioCamion.js";

class AgendaCargaRepository {
  async create(data) {
    return await AgendaCarga.create(data);
  }

  async findOneByCamion(id_camion) {
    return await AgendaCarga.findOne({
      where: {
        id_camion,
      },
    });
  }

  async findByPk(id_agenda_carga) {
    return await AgendaCarga.findByPk(id_agenda_carga);
  }

  async findById(id) {
    return await AgendaCarga.findByPk(id, {
      include: [
        {
          model: DetalleTransaccion,
          as: "detalles",
          include: [
            {
              model: Transaccion,
              as: "transaccion",
              include: [
                {
                  model: Cliente,
                  as: "cliente",
                },
              ],
            },
            {
              model: Producto,
              as: "producto",
            },
          ],
        },
        {
          model: Usuarios,
          as: "usuario", // Información del chofer
          attributes: ["rut", "nombre", "email"],
        },
        {
          model: Camion,
          as: "camion", // Información del camión
          include: [
            {
              model: InventarioCamion,
              as: "inventario", // Incluye el inventario del camión
              include: [
                {
                  model: Producto,
                  as: "producto", // Incluye datos del producto en el inventario
                },
              ],
            },
          ],
        },
      ],
    });
  }

  async findAll(data) {
    return await AgendaCarga.findAll(data);
  }

  async update(id, data) {
    const agenda = await AgendaCarga.findByPk(id);
    if (!agenda) {
      throw new Error("Agenda not found");
    }
    return await agenda.update(data);
  }

  async delete(id) {
    const agenda = await AgendaCarga.findByPk(id);
    if (!agenda) {
      throw new Error("Agenda not found");
    }
    return await agenda.destroy();
  }

  getModel() {
    return AgendaCarga;
  }
}

export default new AgendaCargaRepository();
