import CompraItem from "../../domain/models/CompraItem.js";
import BaseRepository from "./BaseRepository.js";


class CompraItemRepository extends BaseRepository {
  constructor() {
    super(CompraItem);
  }
}
export default new CompraItemRepository();
