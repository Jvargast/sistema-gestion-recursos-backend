import UsuariosRepository from "../../auth/infraestructure/repositories/UsuariosRepository.js";
import CajaRepository from "../infrastructure/repositories/CajaRepository.js";

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
  

  async verificarEstadoCaja(rutUsuario) {
    const usuario = UsuariosRepository.findByRut(rutUsuario);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    console.log(usuario);
    const estado = "abierta";
    const caja = CajaRepository.findCajaEstadoByUsuario(rutUsuario, estado);
    return caja;
  }

  async getCajaAsignada(rutUsuario) {
    const usuario = await UsuariosRepository.findByRut(rutUsuario);
    if (!usuario) {
      throw new Error("Usuario no encontrado.");
    }

    const caja = await CajaRepository.findByAsignado(rutUsuario);

    return caja;
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

  async cerrarCaja(idCaja, saldoFinal, rutUsuario) {
    const caja = await this.getCajaById(idCaja);

    if (caja.estado === "cerrada") {
      throw new Error("La caja ya está cerrada.");
    }

    const datosActualizados = {
      estado: "cerrada",
      saldo_final: saldoFinal,
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
