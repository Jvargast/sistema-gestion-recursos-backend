import GastoAdjunto from "../../domain/models/GastoAdjunto.js";
import BaseRepository from "./BaseRepository.js";

class GastoAdjuntoRepository extends BaseRepository {
  constructor() {
    super(GastoAdjunto);
  }
}

export default new GastoAdjuntoRepository();
