import DetalleTransaccionService from "../../application/DetalleTransaccionService.js";
import TransaccionService from "../../application/TransaccionService.js";

class TransaccionController {
  async getTransaccionById(req, res) {
    try {
      const { id } = req.params;
      const transaccion = await TransaccionService.getTransaccionById(id);
      res.status(200).json(transaccion);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllTransacciones(req, res) {
    try {
      const filters = req.query; // Filtros enviados en los query params
      let options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        search: req.query.search
      };
    
      delete filters.limit;
      delete filters.offset;
      const transacciones = await TransaccionService.getAllTransacciones(
        filters,
        options
      );
      res.status(200).json(transacciones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createTransaccion(req, res) {
    try {
      const { detalles, ...data } = req.body;
      const { rut } = req.user;
      const transaccion = await TransaccionService.createTransaccion(
        data,
        detalles,
        rut
      );
      res.status(201).json(transaccion);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async addDetallesToTransaccion(req, res) {
    try {
      const { id } = req.params;
      const { productos } = req.body;
      const { rut } = req.user; // Se obtiene del token del usuario autenticado
      await TransaccionService.addDetallesToTransaccion(
        id,
        productos,
        rut
      );
      res
        .status(200)
        .json({ message: "Detalles agregados a la transacción con éxito." });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async changeEstado(req, res) {
    try {
      const { id } = req.params;
      const { id_estado_transaccion } = req.body;
      const { rut } = req.user;
      await TransaccionService.changeEstadoTransaccion(
        id,
        id_estado_transaccion,
        rut
      );

      res
        .status(200)
        .json({ message: "Estado de la transacción cambiada con éxito." });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async changeTipoTransaccion(req, res) {
    try {
      const { id } = req.params;
      const { tipo_transaccion } = req.body;
      const { rut } = req.user;
      await TransaccionService.changeTipoTransaccion(id, tipo_transaccion, rut);
      res
        .status(200)
        .json({ message: "Tipo de la transacción cambiado con éxito." });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async changeEstadoDetalles(req, res) {
    try {
      const { id } = req.params;
      const { nuevoEstado } = req.body;
      const { rut } = req.user
      await DetalleTransaccionService.cambiarEstadoDetalles(id, nuevoEstado, rut);
      res
        .status(200)
        .json({ message: "Estado del detalle cambiado con éxito." });
    }catch(error) {
      res.status(400).json({ error: error.message });
    }
  }

  async completeTransaction(req, res) {
    try {
      const { rut } = req.user;
      const { id } = req.params;
      const {  metodo_pago, referencia } = req.body;

      const completeTransaction = await TransaccionService.completarTransaccion(
        id,
        metodo_pago,
        referencia,
        rut
      );
      res.status(200).json(completeTransaction);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async finalizarTransaccion(req, res) {
    try {
      const { rut } = req.user;
      const {id} = req.params;

      const finalizarTransaccion = await TransaccionService.finalizarTransaccion(id, rut);
      res.status(200).json(finalizarTransaccion);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async asignarTransaccion(req, res) {
    try {
      //Falta lógica para el usuario que lo hace
      const { rut } = req.user;
      const { id } = req.params;
      const { id_usuario } = req.body;

      await TransaccionService.asignarTransaccionAUsuario(
        id,
        id_usuario,
        rut
      );
      res.status(200).json({message: "Usuario asigado con éxito"});
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async actualizarEstadoYRegistrarPago(req, res) {
    try {
      const { id_transaccion, detallesActualizados, pago } = req.body;
      const { id_usuario } = req.user;

      const resultado = await TransaccionService.actualizarEstadoYRegistrarPago(
        id_transaccion,
        detallesActualizados,
        pago,
        id_usuario
      );
      res.status(200).json(resultado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteTransacciones(req, res) {
    try {
      const { ids } = req.body;
      const { rut } = req.user;
      const result = await TransaccionService.deleteTransacciones(ids, rut);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new TransaccionController();
