import PermisosService from "../../application/PermisosService";

class PermisosController {
  async create(req, res) {
    try {
      const permiso = await PermisosService.createPermiso(req.body);
      res.status(201).json(permiso);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const permiso = await PermisosService.updatePermiso(id, req.body);
      res.status(200).json(permiso);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await PermisosService.deletePermiso(id);
      res.status(200).json({ message: 'Permiso eliminado con éxito' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async findAll(req, res) {
    try {
      const permisos = await PermisosService.getAllPermisos();
      res.status(200).json(permisos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;
      const permiso = await PermisosService.getPermisoById(id);
      res.status(200).json(permiso);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

export default new PermisosController();