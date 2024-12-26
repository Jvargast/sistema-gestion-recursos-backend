import RolesService from "../../application/RolesService.js";

class RolController {
  /**
   * Crear un nuevo rol.
   */
  async createRole(req, res) {
    const { nombre, descripcion, permisos } = req.body;

    try {
      const rol = await RolesService.createRol({
        nombre,
        descripcion,
        permisos,
      });
      res.status(201).json(rol);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Actualizar un rol.
   */
  async updateRole(req, res) {
    const { id } = req.params;
    const { nombre, descripcion, permisos } = req.body.updatedRole;
    console.log(req.body)

    try {
      const updatedRol = await RolesService.updateRol(id, {
        nombre,
        descripcion,
        permisos,
      });
      res.status(200).json(updatedRol);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtener un rol por su ID.
   */
  async getRoleById(req, res) {
    const { id } = req.params;

    try {
      const rol = await RolesService.getRolById(id);
      res.status(200).json(rol);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Obtener todos los roles.
   */
  async getAllRoles(req, res) {
    try {
      const filters = req.query;
      let options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 20) || 20,
        search: req.query.search,
      };
      delete filters.limit;
      delete filters.offset;
      const roles = await RolesService.getAllRoles(filters, options);
      res.status(200).json({ data: roles.data, total: roles.pagination });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Eliminar un rol.
   */
  async deleteRol(req, res) {
    const { id } = req.params;

    try {
      const result = await RolesService.deleteRol(id);
      if (result === 0) {
        res.status(404).json({ error: "El rol especificado no existe" });
      } else {
        res.status(200).json({ message: "Rol eliminado exitosamente" });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new RolController();
