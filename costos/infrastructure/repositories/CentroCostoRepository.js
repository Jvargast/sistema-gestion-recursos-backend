import BaseRepository from "./BaseRepository.js";
import CentroCosto from "../../domain/models/CentroCosto.js";

class CentroCostoRepository extends BaseRepository {
  constructor() {
    super(CentroCosto);
  }
}
export default new CentroCostoRepository();
