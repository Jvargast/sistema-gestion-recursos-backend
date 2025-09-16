import BaseRepository from "./BaseRepository.js";
import CategoriaGasto from "../../domain/models/CategoriaGasto.js";

class CategoriaGastoRepository extends BaseRepository {
  constructor() {
    super(CategoriaGasto);
  }
}
export default new CategoriaGastoRepository();
