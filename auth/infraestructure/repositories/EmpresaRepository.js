import Empresa from "../../domain/models/Empresa.js";

class EmpresaRepository {
  async getAllEmpresas() {
    try {
      const empresas = await Empresa.findAll();
      return empresas;
    } catch (error) {
      console.error("Error al obtener empresas:", error);
      throw new Error("Error al obtener empresas.");
    }
  }

  async getEmpresaById(id_empresa) {
    try {
      const empresa = await Empresa.findByPk(id_empresa);
      return empresa;
    } catch (error) {
      console.error("Error al obtener la empresa:", error);
      throw new Error("Error al obtener la empresa.");
    }
  }

  async getEmpresaByNombre(nombre) {
    return await Empresa.findOne({
      where: { nombre: { [Op.iLike]: `%${nombre}%` } }, // Búsqueda no sensible a mayúsculas
      include: [
        {
          model: Sucursal,
          as: "sucursales",
          attributes: ["id_sucursal", "nombre", "direccion", "telefono"],
        },
      ],
    });
  }

  async getEmpresaByUsuario(rutUsuario) {
    return await Empresa.findOne({
      include: [
        {
          model: Usuarios,
          as: "usuarios",
          where: { rut: rutUsuario },
          attributes: ["rut", "nombre", "apellido", "email"],
        },
      ],
    });
  }

  async updateEmpresa(id_empresa, data) {
    try {
      const empresa = await Empresa.findByPk(id_empresa);
      if (!empresa) {
        throw new Error("Empresa no encontrada.");
      }

      // Actualizar los datos de la empresa
      await empresa.update(data);

      return empresa;
    } catch (error) {
      console.error("Error al actualizar la empresa:", error);
      throw new Error("Error al actualizar la empresa.");
    }
  }

  getModel() {
    return Empresa;
  }
}

export default new EmpresaRepository();
