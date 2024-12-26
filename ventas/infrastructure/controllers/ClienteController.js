import ClienteService from "../../application/ClienteService.js";

class ClienteController {
  async getClienteById(req, res) {
    try {
      const { id } = req.params;
      const cliente = await ClienteService.getClienteById(id);
      res.status(200).json(cliente);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllClientes(req, res) {
    try {
      const filters = req.query; // Filtros enviados en los query params
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        search: req.query.search
      };
      delete filters.limit;
      delete filters.offset;
      const clientes = await ClienteService.getAllClientes(filters, options);
      res.status(200).json({data: clientes.data, total: clientes.pagination});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createCliente(req, res) {
    try {
      const cliente = await ClienteService.createCliente(req.body);
      res.status(201).json(cliente);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateCliente(req, res) {
    try {
      const { id } = req.params;
      console.log("REQ", req.body);
      const updated = await ClienteService.updateCliente(id, req.body.formData);
      res.status(200).json({message: "Cliente actualizado correctamente",updated});
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deactivateCliente(req, res) {
    try {
      const { id } = req.params;
      const result = await ClienteService.deactivateCliente(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async reactivateCliente(req, res) {
    try {
      const { id } = req.params;
      const result = await ClienteService.reactivateCliente(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async searchClientes(req, res) {
    try {
      const filters = req.query; // Filtros enviados en los query params
      const clientes = await ClienteService.searchClientes(filters);
      res.status(200).json(clientes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteClientes(req,res) {
    try {
      const { ids } = req.body;
      const { rut } = req.user;

      const result = await ClienteService.deleteClientes(ids, rut);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new ClienteController();
