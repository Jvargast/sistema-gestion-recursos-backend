import Insumo from "../../../inventario/domain/models/Insumo.js";
import ConsumoInsumo from "../../domain/models/ConsumoInsumo.js";

class ConsumoInsumoRepository {

  async findByProduccion(id_produccion) {
    return await ConsumoInsumo.findAll({
      where: { id_produccion },
      include: [{ model: Insumo, as: "insumo" }],
    });
  }


  async bulkCreate(registros) {
    return await ConsumoInsumo.bulkCreate(registros);
  }

  async deleteByProduccion(id_produccion, transaction) {
    return await ConsumoInsumo.destroy({
      where: { id_produccion },
      transaction,
    });
  }

  getModel() {
    return ConsumoInsumo;
  }
}

export default new ConsumoInsumoRepository();
