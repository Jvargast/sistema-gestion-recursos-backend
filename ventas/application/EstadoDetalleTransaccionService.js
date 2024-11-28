import EstadoDetalleTransaccionRepository from "../infrastructure/repositories/EstadoDetalleTransaccionRepository.js";

class EstadoDetalleTransaccionService {

    async findByNombre(nombreEstado) {
      const estado = await EstadoDetalleTransaccionRepository.findByNombre(nombreEstado);
      if (!estado) {
        throw new Error(`Estado "${nombreEstado}" no encontrado.`);
      }
      return estado;
    }
  
    async findById(idEstado) {
      const estado = await EstadoDetalleTransaccionRepository.findById(idEstado);
      if (!estado) {
        throw new Error(`Estado con ID "${idEstado}" no encontrado.`);
      }
      return estado;
    }
  
    async getAllEstados() {
      return await EstadoDetalleTransaccionRepository.findAll();
    }
  
    async createEstado(data) {
      const { nombre_estado } = data;
  
      // Validar que no exista un estado con el mismo nombre
      const existingEstado = await EstadoDetalleTransaccionRepository.findByNombre(nombre_estado);
      if (existingEstado) {
        throw new Error(`El estado "${nombre_estado}" ya existe.`);
      }
  
      return await EstadoDetalleTransaccionRepository.create(data);
    }
  
    async updateEstado(idEstado, data) {
      const estado = await EstadoDetalleTransaccionRepository.findById(idEstado);
      if (!estado) {
        throw new Error(`Estado con ID "${idEstado}" no encontrado.`);
      }
  
      return await EstadoDetalleTransaccionRepository.update(idEstado, data);
    }
  
    async deleteEstado(idEstado) {
      const estado = await EstadoDetalleTransaccionRepository.findById(idEstado);
      if (!estado) {
        throw new Error(`Estado con ID "${idEstado}" no encontrado.`);
      }
  
      // Validación adicional: evitar eliminar estados críticos si es necesario
      if (estado.nombre_estado === "En Proceso" || estado.nombre_estado === "Facturación Incompleta") {
        throw new Error(`No se puede eliminar el estado crítico "${estado.nombre_estado}".`);
      }
  
      return await EstadoDetalleTransaccionRepository.delete(idEstado);
    }

    
  }
  
  export default new EstadoDetalleTransaccionService();
  