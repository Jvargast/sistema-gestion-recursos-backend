import BaseRepository from "./BaseRepository.js";
import OrdenPago from "../../domain/models/OrdenPago.js";
import OrdenPagoItem from "../../domain/models/OrdenPagoItem.js";
import Proveedor from "../../domain/models/Proveedor.js";
import Compra from "../../domain/models/Compra.js";
import Gasto from "../../domain/models/Gasto.js";

const defaultInclude = [
  {
    model: Proveedor,
    as: "proveedor",
    attributes: ["id_proveedor", "razon_social", "rut"],
  },
  { model: OrdenPagoItem, as: "items" },
  { model: Compra, as: "compra" },
  { model: Gasto, as: "gasto" },
];

class OrdenPagoRepository extends BaseRepository {
  constructor() {
    super(OrdenPago);
  }

  async findById(id, options = {}) {
    return super.findByPk(id, {
      ...options,
      include: options.include ?? defaultInclude,
    });
  }

  async findOneByConditions(conditions) {
    return OrdenPago.findOne(conditions);
  }
}
export default new OrdenPagoRepository();
