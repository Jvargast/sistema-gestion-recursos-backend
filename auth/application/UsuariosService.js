import bcrypt from "bcrypt";
import crypto from "crypto";
import UsuariosRepository from "../infraestructure/repositories/UsuariosRepository.js";
import RolesRepository from "../infraestructure/repositories/RolRepository.js";
import EmailService from "../application/helpers/EmailService.js";
import RolesService from "./RolesService.js";
import createFilter from "../../shared/utils/helpers.js";
import { Op } from "sequelize";
import EmpresaRepository from "../infraestructure/repositories/EmpresaRepository.js";
import SucursalRepository from "../infraestructure/repositories/SucursalRepository.js";
import paginate from "../../shared/utils/pagination.js";
import CajaRepository from "../../ventas/infrastructure/repositories/CajaRepository.js";

class UsuarioService {
  /**
   * @param {Object} data - Datos del usuario.
   * @returns {Promise<Object>} - Retorna el usuario creado.
   */
  async createUsuario(data) {
    const { rut, nombre, apellido, email, rolId, id_empresa, id_sucursal } =
      data;

    const usuario_existente = await UsuariosRepository.findByRutBasic(rut);
    if (usuario_existente) {
      throw new Error("El usuario ya existe en el sistema");
    }
    const rol = await RolesRepository.findById(rolId);
    if (!rol) {
      throw new Error("El rol especificado no existe");
    }

    const tempPassword = crypto.randomBytes(8).toString("hex"); 
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

    const usuario = await UsuariosRepository.create({
      rut,
      nombre,
      apellido,
      email,
      password: hashedPassword,
      rolId,
      id_empresa,
      id_sucursal,
    });

    await EmailService.sendPasswordEmail(email, tempPassword);

    return usuario;
  }

  async createNewUsuario(userData) {
    const {
      rut,
      nombre,
      apellido,
      email,
      password,
      rolId,
      id_empresa,
      id_sucursal,
    } = userData;

    const usuario_existente = await UsuariosRepository.findByRut(rut);
    if (usuario_existente) {
      throw new Error("El usuario ya existe en el sistema");
    }

    const rol = await RolesRepository.findById(rolId);
    if (!rol) {
      throw new Error("El rol especificado no existe");
    }

    if (!password || password.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const usuario = await UsuariosRepository.create({
      rut,
      nombre,
      apellido,
      email,
      password: hashedPassword,
      rolId,
      id_empresa,
      id_sucursal,
    });

    return usuario;
  }

  async getAllUsuarios(filters = {}, options) {
    const allowedFields = ["rut"];
    const where = createFilter(filters, allowedFields);
    if (options.search) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${options.search}%` } },
        { apellido: { [Op.like]: `%${options.search}%` } },
        { email: { [Op.like]: `%${options.search}%` } },
      ];
    }

    if (filters.id_sucursal) {
      where.id_sucursal = Number(filters.id_sucursal);
    }
    const include = [
      {
        model: RolesRepository.getModel(),
        as: "rol",
        attributes: ["nombre"],
      },
      {
        model: EmpresaRepository.getModel(),
        as: "Empresa",
        attributes: ["nombre", "direccion", "telefono", "email", "rut_empresa"],
      },
      {
        model: SucursalRepository.getModel(),
        as: "Sucursal",
        attributes: ["id_sucursal", "nombre", "direccion", "telefono"],
      },
    ];
    const result = await paginate(UsuariosRepository.getModel(), options, {
      where,
      include,
      order: [["fecha_registro", "ASC"]],
    });

    return result;
  }

  async getAllChoferes(filters = {}, options) {
    try {
      const rolIdChofer = await RolesService.getRolIdByName("chofer");
      const includeExtra = [
        {
          model: SucursalRepository.getModel(),
          as: "Sucursal",
          attributes: ["id_sucursal", "nombre"],
          required: false,
        },
        {
          model: CajaRepository.getModel(),
          as: "cajasAsignadas",
          attributes: ["id_sucursal"],
          required: false,
        },
      ];

      let whereExtra = {};
      if (filters.id_sucursal != null && filters.id_sucursal !== "") {
        const sid = Number(filters.id_sucursal);
        whereExtra = {
          [Op.or]: [
            { id_sucursal: sid },
            { "$Sucursal.id_sucursal$": sid },
            { "$cajasAsignadas.id_sucursal$": sid },
          ],
        };
      }


      return await UsuariosRepository.findAllByRolId(rolIdChofer, {
        whereExtra,
        includeExtra,
        order: [["nombre", "ASC"]],
      });
    } catch (error) {
      throw new Error(`Error al obtener choferes: ${error.message}`);
    }
  }

  async getAllVendedores(filters = {}, options) {
    try {
      const rolVendedor = await RolesService.getRolIdByName("vendedor");
      const vendedores = await UsuariosRepository.findAllVendedoresConCaja(
        rolVendedor
      );

      return vendedores;
    } catch (error) {
      throw new Error(`Error al obtener choferes: ${error.message}`);
    }
  }

  async getAllUsuariosConCaja(filters = {}, options) {
    try {
      const usuarios = await UsuariosRepository.findAllUsuariosConCaja();

      return usuarios;
    } catch (error) {
      throw new Error(`Error al obtener choferes: ${error.message}`);
    }
  }

  /**
   * Obtener un usuario por su RUT.
   */
  async getUsuarioByRut(rut) {
    const usuario = await UsuariosRepository.findByRut(rut);

    return usuario;
  }

  async getUsuarioById(rut) {
    return await UsuariosRepository.findOne(rut);
  }

  /**
   * Actualizar un usuario.
   */
  async updateUsuario(rut, data) {
    const result = await UsuariosRepository.update(rut, data);

    if (result[0] === 0) {
      throw new Error(
        "No se pudo actualizar el usuario, posiblemente no existe..."
      );
    }

    return { message: "Usuario actualizado exitosamente" };
  }

  /**
   * Desactivar un usuario (marcar como inactivo).
   */
  async deactivateUsuario(rut) {
    const result = await UsuariosRepository.deactivate(rut);

    if (result[0] === 0) {
      throw new Error(
        "No se pudo desactivar el usuario, posiblemente no existe"
      );
    }

    return { message: "Usuario desactivado exitosamente" };
  }

  /**
   * @param {string} rut - RUT del usuario.
   * @param {string} currentPassword - Contraseña actual del usuario.
   * @param {string} newPassword - Nueva contraseña.
   * @param {string} confirmPassword - Confirmación de la nueva contraseña.
   * @returns {Promise<object>} - Mensaje de éxito o error.
   */
  async changePassword(rut, currentPassword, newPassword, confirmPassword) {
    try {
      if (!newPassword || newPassword.length < 8) {
        throw new Error(
          "La nueva contraseña debe tener al menos 8 caracteres."
        );
      }
      if (newPassword !== confirmPassword) {
        throw new Error("La confirmación de la contraseña no coincide.");
      }

      const usuario = await UsuariosRepository.findByRut(rut);
      if (!usuario) {
        throw new Error("Usuario no encontrado.");
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        usuario.password
      );
      if (!isPasswordValid) {
        throw new Error("La contraseña actual es incorrecta.");
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      await UsuariosRepository.update(rut, { password: hashedNewPassword });

      return { message: "Contraseña actualizada exitosamente." };
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error.message);
      throw new Error(error.message);
    }
  }

  /**
   * @param {string} plainPassword - Contraseña sin encriptar.
   * @param {string} hashedPassword - Contraseña encriptada.
   * @returns {Promise<boolean>} - True si las contraseñas coinciden.
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async resetUserPassword(rut) {
    const usuario = await UsuariosRepository.findByRut(rut);

    if (!usuario) {
      throw new Error("El usuario no existe.");
    }

    const newTempPassword = crypto.randomBytes(8).toString("hex");

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newTempPassword, saltRounds);

    usuario.password = hashedPassword;
    await UsuariosRepository.update(usuario);

    return { usuario, newTempPassword };
  }

  async updateUserById(rut, updateData) {
    try {
      const usuario = await UsuariosRepository.findByRut(rut);

      if (!usuario) {
        throw new Error("El usuario no existe.");
      }

      const result = await UsuariosRepository.update(rut, updateData);

      if (result[0] === 0) {
        throw new Error(
          "No se pudo actualizar el usuario, posiblemente no existe."
        );
      }

      return {
        message: "Usuario actualizado exitosamente.",
        usuario: result[1],
      };
    } catch (error) {
      console.error("Error al actualizar el usuario:", error.message);
      throw new Error("No se pudo completar la actualización del usuario.");
    }
  }

  async updatePassword(rut, newPassword) {
    const usuario = await UsuariosRepository.findByRut(rut);

    if (!usuario) {
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UsuariosRepository.update(rut, { password: hashedPassword });
    return true;
  }
}

export default new UsuarioService();
