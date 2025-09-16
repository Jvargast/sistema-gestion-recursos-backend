import BaseRepository from "./BaseRepository.js";
import OrdenPagoItem from "../../domain/models/OrdenPagoItem.js";

class OrdenPagoItemRepository extends BaseRepository {
  constructor() {
    super(OrdenPagoItem);
  }
}
export default new OrdenPagoItemRepository();
