import moment from "moment";
import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import CajaRepository from "../infrastructure/repositories/CajaRepository.js";
import HistorialCajaRepository from "../infrastructure/repositories/HistorialCajaRepository.js";

class CajaService {
  async getCajaById(id) {
    const caja = await CajaRepository.findById(id);
    if (!caja) throw new Error("Caja no encontrada.");
    return caja;
  }

  async getAllCajas() {
    return await CajaRepository.findAll();
  }

  async createCaja(data) {
    return await CajaRepository.create(data);
  }

  async updateCaja(id, data) {
    const caja = await this.getCajaById(id);
    if (!caja) {
      throw new Error(`La caja con id ${id} no existe.`);
    }

    try {
      const updated = await CajaRepository.update(id, data);

      if (!updated || updated[0] === 0) {
        throw new Error(
          `No se pudo actualizar la caja con id ${id}. Verifica los datos.`
        );
      }

      return await this.getCajaById(id);
    } catch (error) {
      console.error("Error al actualizar la caja:", error.message);
      throw error;
    }
  }

  async verificarEstadoCaja(rutUsuario, rol) {
    const usuario = await UsuariosRepository.findByRut(rutUsuario);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    const estado = "abierta";

    if (rol === "administrador") {
      return await CajaRepository.findCajaEstado(estado);
    }

    return await CajaRepository.findCajaEstadoByUsuario(rutUsuario, estado);
  }

  async getCajaAsignada(rutUsuario) {
    const usuario = await UsuariosRepository.findByRut(rutUsuario);
    if (!usuario) {
      throw new Error("Usuario no encontrado.");
    }


    const caja = await CajaRepository.findByAsignado(rutUsuario);

    if (!caja) return null;

    const cajaListaParaAbrir = caja.estado === "cerrada";

    return { caja, cajaListaParaAbrir };
  }

  async abrirCaja(idCaja, saldoInicial, rutUsuario) {
    const caja = await this.getCajaById(idCaja);

    if (caja.estado === "abierta") {
      throw new Error("La caja ya está abierta.");
    }

    const datosActualizados = {
      estado: "abierta",
      saldo_inicial: saldoInicial,
      fecha_apertura: new Date(),
      usuario_apertura: rutUsuario,
    };

    return await this.updateCaja(idCaja, datosActualizados);
  }

  async cerrarCaja(idCaja, rutUsuario) {
    const caja = await this.getCajaById(idCaja);

    if (!caja) {
      throw new Error("La caja no existe.");
    }

    if (caja.estado === "cerrada") {
      throw new Error("La caja ya está cerrada.");
    }

    // Registrar el historial antes de actualizar el estado de la caja
    await HistorialCajaRepository.create({
      id_caja: idCaja,
      id_sucursal: caja.id_sucursal,
      fecha_cierre: new Date(),
      saldo_final: caja.saldo_final,
      usuario_cierre: rutUsuario,
      observaciones: `Cierre de caja registrado el ${new Date().toLocaleString()}`,
    });

    // Actualizar la caja a estado "cerrada"
    const datosActualizados = {
      estado: "cerrada",
      saldo_final: null,
      fecha_cierre: new Date(),
      usuario_cierre: rutUsuario,
    };

    return await this.updateCaja(idCaja, datosActualizados);
  }

  async deleteCaja(id) {
    const deleted = await CajaRepository.delete(id);
    if (deleted === 0) throw new Error("No se pudo eliminar la caja.");
    return true;
  }
}

export default new CajaService();
