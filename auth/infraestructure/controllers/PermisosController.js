import PermisosService from "../../application/PermisosService.js";

class PermisosController {
  async createPermiso(req, res) {
    try {
      const permiso = await PermisosService.createPermiso(req.body);
      res.status(201).json(permiso);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updatePermiso(req, res) {
    try {
      const { id } = req.params;
      const permiso = await PermisosService.updatePermiso(id, req.body);
      res.status(200).json(permiso);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deletePermiso(req, res) {
    try {
      const { id } = req.params;
      await PermisosService.deletePermiso(id);
      res.status(200).json({ message: "Permiso eliminado con éxito" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllPermisos(req, res) {
    try {
      const filters = req.query;

      console.log(req.query.limit)
      let options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        search: req.query.search,
      };

      const permisos = await PermisosService.findAllPermisos(filters, options);
      res.status(200).json({ data: permisos.data, total: permisos.pagination });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPermisoById(req, res) {
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
