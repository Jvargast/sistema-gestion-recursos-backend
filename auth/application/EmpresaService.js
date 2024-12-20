import EmpresaRepository from "../infraestructure/repositories/EmpresaRepository.js";

class EmpresaService {

  async obtenerEmpresas() {
    try {
      const empresas = await EmpresaRepository.getAllEmpresas();
      return empresas;
    } catch (error) {
      console.error("Error al obtener las empresas:", error);
      throw new Error("Error al obtener las empresas.");
    }
  }

 
  async obtenerEmpresaPorId(id_empresa) {
    try {
      const empresa = await EmpresaRepository.getEmpresaById(id_empresa);
      if (!empresa) {
        throw new Error("Empresa no encontrada.");
      }
      return empresa;
    } catch (error) {
      console.error("Error al obtener la empresa por ID:", error);
      throw new Error("Error al obtener la empresa.");
    }
  }


  async obtenerEmpresaPorNombre(nombre) {
    try {
      const empresa = await EmpresaRepository.getEmpresaByNombre(nombre);
      if (!empresa) {
        throw new Error("Empresa no encontrada.");
      }
      return empresa;
    } catch (error) {
      console.error("Error al obtener la empresa por nombre:", error);
      throw new Error("Error al obtener la empresa.");
    }
  }


  async obtenerEmpresaDeUsuario(rutUsuario) {
    try {
      const empresa = await EmpresaRepository.getEmpresaByUsuario(rutUsuario);
      if (!empresa) {
        throw new Error("No se encontró la empresa asociada al usuario.");
      }
      return empresa;
    } catch (error) {
      console.error("Error al obtener la empresa del usuario:", error);
      throw new Error("Error al obtener la empresa asociada al usuario.");
    }
  }


  async editarEmpresa(id_empresa, data) {
    try {
      const empresaActualizada = await EmpresaRepository.updateEmpresa(
        id_empresa,
        data
      );
      return empresaActualizada;
    } catch (error) {
      console.error("Error al editar la empresa:", error);
      throw new Error("Error al editar la empresa.");
    }
  }
}

export default new EmpresaService();
