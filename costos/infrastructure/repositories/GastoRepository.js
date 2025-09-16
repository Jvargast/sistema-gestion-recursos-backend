import Sucursal from "../../../auth/domain/models/Sucursal.js";
import CategoriaGasto from "../../domain/models/CategoriaGasto.js";
import CentroCosto from "../../domain/models/CentroCosto.js";
import Gasto from "../../domain/models/Gasto.js";
import GastoAdjunto from "../../domain/models/GastoAdjunto.js";
import Proveedor from "../../domain/models/Proveedor.js";
import BaseRepository from "./BaseRepository.js";

const defaultInclude = [
  {
    model: Proveedor,
    as: "proveedor",
    attributes: ["id_proveedor", "razon_social", "rut"],
  },
  {
    model: CategoriaGasto,
    as: "categoria",
    attributes: ["id_categoria_gasto", "nombre_categoria", "tipo_categoria"],
  },
  {
    model: CentroCosto,
    as: "centro_costo",
    attributes: ["id_centro_costo", "nombre", "tipo"],
  },
  {
    model: GastoAdjunto,
    as: "adjuntos",
    attributes: [
      "id_adjunto",
      "original_name",
      "filename",
      "path_rel",
      "mimetype",
      "size",
      "fecha_subida",
    ],
  },
  { model: Sucursal, as: "sucursal", attributes: ["id_sucursal", "nombre"] },
];

class GastoRepository extends BaseRepository {
  constructor() {
    super(Gasto);
  }

  async findById(id, options = {}) {
    return super.findByPk(id, {
      ...options,
      include: options.include ?? defaultInclude,
    });
  }

  async findOneByConditions(conditions) {
    return Gasto.findOne(conditions);
  }

  async count(options = {}) {
    return Gasto.count(options);
  }
}
export default new GastoRepository();
