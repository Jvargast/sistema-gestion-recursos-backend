import BaseRepository from "./BaseRepository.js";
import Proveedor from "../../domain/models/Proveedor.js";

class ProveedorRepository extends BaseRepository {
  constructor() {
    super(Proveedor);
  }
}
export default new ProveedorRepository();
