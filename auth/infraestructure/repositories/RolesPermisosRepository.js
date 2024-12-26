import RolesPermisos from "../../domain/models/RolesPermisos.js";

class RolesPermisosRepository {
  getModel() {
    return RolesPermisos;
  }
}

export default new RolesPermisosRepository();
