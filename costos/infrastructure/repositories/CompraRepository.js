import Insumo from "../../../inventario/domain/models/Insumo.js";
import Compra from "../../domain/models/Compra.js";
import CompraItem from "../../domain/models/CompraItem.js";
import Proveedor from "../../domain/models/Proveedor.js";
import BaseRepository from "./BaseRepository.js";


const defaultInclude = [
  {
    model: Proveedor,
    as: "proveedor",
    attributes: ["id_proveedor", "razon_social", "rut"],
  },
  {
    model: CompraItem,
    as: "items",
    include: [
      {
        model: Insumo,
        as: "insumo",
        attributes: ["id_insumo", "nombre_insumo", "unidad_de_medida"],
      },
    ],
  },
];

class CompraRepository extends BaseRepository {
  constructor() {
    super(Compra);
  }

  async findById(id, options = {}) {
    return super.findByPk(id, {
      ...options,
      include: options.include ?? defaultInclude,
    });
  }

  async findOneByConditions(conditions) {
    return Compra.findOne(conditions);
  }
}

export default new CompraRepository();
