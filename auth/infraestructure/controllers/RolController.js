import RolesService from "../../application/RolesService.js";

class RolController {
  /**
   * Crear un nuevo rol.
   */
  async create(req, res) {
    const { nombre, descripcion, permisos } = req.body;

    try {
      const rol = await RolesService.createRol({ nombre, descripcion, permisos });
      res.status(201).json(rol);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Actualizar un rol.
   */
  async update(req, res) {
    const { id } = req.params;
    const { nombre, descripcion, permisos } = req.body;

    try {
      const updatedRol = await RolesService.updateRol(id, { nombre, descripcion, permisos });
      res.status(200).json(updatedRol);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtener un rol por su ID.
   */
  async findById(req, res) {
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
  async findAll(req, res) {
    try {
      const roles = await RolesService.getAllRoles();
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Eliminar un rol.
   */
  async delete(req, res) {
    const { id } = req.params;

    try {
      const result = await RolesService.deleteRol(id);
      if (result === 0) {
        res.status(404).json({ error: 'El rol especificado no existe' });
      } else {
        res.status(200).json({ message: 'Rol eliminado exitosamente' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new RolController();