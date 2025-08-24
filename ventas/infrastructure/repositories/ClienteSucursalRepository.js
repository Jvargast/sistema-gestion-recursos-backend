import ClienteSucursal from "../../domain/models/ClienteSucursal.js";

class ClienteSucursalRepository {
  getModel() {
    return ClienteSucursal;
  }
}

export default new ClienteSucursalRepository();
