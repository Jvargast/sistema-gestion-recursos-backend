import IPagoRepository from "../../domain/repositories/IPagoRepository.js";
import Pago from "../../domain/models/Pago.js";
import EstadoPago from "../../domain/models/EstadoPago.js";
import MetodoPago from "../../domain/models/MetodoPago.js";
import Transaccion from "../../domain/models/Transaccion.js";
import Cliente from "../../domain/models/Cliente.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Roles from "../../../auth/domain/models/Roles.js";

class PagoRepository extends IPagoRepository {
  async findById(id) {
    return await Pago.findByPk(id, {
      include: [
        { model: EstadoPago, as: "estado", attributes: ["nombre"] },
        { model: MetodoPago, as: "metodo", attributes: ["nombre"] },
        {
          model: Transaccion,
          as: "transaccionPago",
          include: [
            {
              model: Cliente,
              as: "cliente",
              attributes: [
                "rut",
                "tipo_cliente",
                "razon_social",
                "nombre",
                "apellido",
                "direccion",
                "telefono",
                "email"
              ],
            },
            {
              model: Usuarios,
              as: "usuario",
              attributes: ["nombre", "rut", "apellido"],
              include: [
                {
                  model: Roles,
                  as: "rol",
                  attributes: ["nombre"]
                }
              ]
            },
          ],
        },
      ],
    });
  }

  async findByTransaccionId(transaccionId) {
    return await Pago.findAll({
      where: { id_transaccion: transaccionId },
      include: [
        { model: EstadoPago, as: "estado" },
        { model: MetodoPago, as: "metodo" },
      ],
    });
  }

  async create(data) {
    return await Pago.create(data);
  }

  async updateEstado(id_pago, nuevo_estado) {
    const pago = await Pago.findByPk(id_pago);
    if (!pago) {
      throw new Error(`Pago con ID ${id_pago} no encontrado.`);
    }

    pago.id_estado_pago = nuevo_estado;
    await pago.save();

    return pago;
  }

  async updatePago(id_pago, id_metodo_pago) {
    const pago = await Pago.findByPk(id_pago);

    if (!pago) throw new Error(`Pago con ID ${id_pago} no encontrado.`);
    if (pago.dataValues.id_metodo_pago == id_metodo_pago) {
      throw new Error(`No se puede actualizar al mismo método de pago`);
    }

    pago.id_metodo_pago = id_metodo_pago;

    await pago.save();

    return pago;
  }

  async updatePagoWithConditions(conditions) {
    const { id_pago, ...fieldsToUpdate } = conditions;

    if (!id_pago) {
      throw new Error("Se requiere un ID de pago para actualizar.");
    }

    // Encuentra el pago por su ID
    const pago = await Pago.findByPk(id_pago);

    if (!pago) {
      throw new Error(`Pago con ID ${id_pago} no encontrado.`);
    }

    // Actualiza los campos dinámicamente
    for (const [key, value] of Object.entries(fieldsToUpdate)) {
      if (value !== undefined) {
        pago[key] = value;
      }
    }

    // Guarda los cambios en la base de datos
    await pago.save();

    return pago;
  }

  async findByIds(ids) {
    return await Pago.findAll({
      where: { id_pago: ids },
    });
  }

  getModel() {
    return Pago;
  }
}

export default new PagoRepository();
