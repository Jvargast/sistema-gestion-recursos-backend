import UsuariosService from "../../../auth/application/UsuariosService.js";
import CajaService from "../../application/CajaService.js";

class CajaController {
  async getCajaById(req, res) {
    try {
      const caja = await CajaService.getCajaById(req.params.id);
      res.status(200).json(caja);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllCajas(req, res) {
    try {
      const cajas = await CajaService.getAllCajas();
      res.status(200).json(cajas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createCaja(req, res) {
    try {
      const caja = await CajaService.createCaja(req.body);
      res.status(201).json(caja);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  async getEstadoCaja(req, res) {
    const rutUsuario = req.user.id;
    const rolUsuario = req.user.rol;

    try {
      const cajas = await CajaService.verificarEstadoCaja(
        rutUsuario,
        rolUsuario
      );
      return res.status(200).json({ cajas });
    } catch (error) {
      console.error("Error al obtener el estado de la caja:", error);
      res.status(500).json({ message: error.message });
    }
  }

  async getCajaAsignada(req, res) {
    const rutUsuario = req.query.rutUsuario || req.user.id;

    try {
      const resultado = await CajaService.getCajaAsignada(rutUsuario);

      return res.status(200).json({
        asignada: resultado.cajas?.length > 0,
        cajas: resultado.cajas || [],
        cajaListaParaAbrir: resultado.cajaListaParaAbrir,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async asignarCaja(req, res) {
    const { id_caja, usuario_asignado } = req.body;

    if (!id_caja || !usuario_asignado) {
      return res.status(400).json({ message: "Faltan datos requeridos." });
    }

    try {
      const usuario = await UsuariosService.getUsuarioByRut(usuario_asignado);
      if (!usuario) {
        return res
          .status(404)
          .json({ message: "El usuario asignado no existe." });
      }

      const updatedCaja = await CajaService.updateCaja(id_caja, {
        usuario_asignado,
      });

      return res
        .status(200)
        .json({ message: "Caja asignada con éxito.", updatedCaja });
    } catch (error) {
      console.error("Error al asignar caja:", error.message);
      return res
        .status(500)
        .json({ message: `Error al asignar caja: ${error.message}` });
    }
  }

  async openCaja(req, res) {
    const { saldoInicial, idCaja } = req.body;
    const rutUsuario = req.user.id;

    try {
      const caja = await CajaService.abrirCaja(
        idCaja,
        saldoInicial,
        rutUsuario
      );
      res.status(200).json(caja);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async closeCaja(req, res) {
    const { idCaja } = req.body;
    const rutUsuario = req.user.id;

    try {
      const caja = await CajaService.cerrarCaja(idCaja, rutUsuario);
      res.status(200).json(caja);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateCaja(req, res) {
    try {
      const caja = await CajaService.updateCaja(req.params.id, req.body);
      res.status(200).json(caja);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCaja(req, res) {
    try {
      await CajaService.deleteCaja(req.params.id);
      res.status(200).json({ message: "Categoría eliminada con éxito" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new CajaController();
