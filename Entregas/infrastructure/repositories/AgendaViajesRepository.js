import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import AgendaViajes from "../../domain/models/AgendaViaje.js";
import Camion from "../../domain/models/Camion.js";
import InventarioCamion from "../../domain/models/InventarioCamion.js";


class AgendaViajesRepository {
  async getChoferesEnTransito() {
    try {
      const choferes = await AgendaViajes.findAll({
        where: { estado: "En Tránsito" }, // Solo viajes en tránsito
        include: [
          {
            model: Usuarios,
            as: "chofer",
            attributes: ["rut", "nombre", "apellido"],
          },
          {
            model: Camion,
            as: "camion",
            attributes: ["id_camion", "placa", "capacidad"],
            include: [
              {
                model: InventarioCamion,
                as: "inventario",
                where: {
                  estado: "En Camión - Disponible",
                },
                include: [
                  {
                    model: Producto,
                    as: "producto",
                    attributes: ["id_producto", "nombre", "descripcion"],
                  },
                ],
                required: false,
              },
            ],
          },
        ],
      });

      return choferes;
    } catch (error) {
      console.error("Error al obtener choferes en tránsito:", error);
      throw new Error("No se pudo obtener la información de los choferes en tránsito.");
    }
  }

  async findByChoferAndEstado(id_chofer, estado) {
    if (!id_chofer || !estado) {
      throw new Error("Se requiere el ID del chofer y el estado del viaje.");
    }
  
    const viaje = await AgendaViajes.findOne({
      where: {
        id_chofer,
        estado,
      },
      include: [
        {
          model: Camion,
          as: "camion",
          attributes: ["id_camion", "placa", "estado"],
        },
      ],
    });
  
    return viaje ? viaje.toJSON() : null;
  }
  
}

export default new AgendaViajesRepository();
