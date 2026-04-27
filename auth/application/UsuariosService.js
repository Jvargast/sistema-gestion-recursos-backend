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
import SecuritySettingsService from "./SecuritySettingsService.js";

class UsuarioService {
  SELF_UPDATE_FIELDS = ["nombre", "apellido", "email"];

  ADMIN_UPDATE_FIELDS = [
    "nombre",
    "apellido",
    "email",
    "rolId",
    "id_empresa",
    "id_sucursal",
    "activo",
    "tipo_cuenta",
    "fecha_expiracion",
  ];

  sanitizeUser(usuario) {
    if (!usuario) return usuario;

    const plain =
      typeof usuario.get === "function" ? usuario.get({ plain: true }) : { ...usuario };

    delete plain.password;
    delete plain.refreshTokens;

    return plain;
  }

  pickAllowedFields(data = {}, allowedFields = []) {
    return Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) => allowedFields.includes(key) && value !== undefined
      )
    );
  }

  async validateEmailAvailability(email, currentRut = null) {
    if (!email) {
      return;
    }

    const existingUser = await UsuariosRepository.findByEmail(email);
    if (existingUser && existingUser.rut !== currentRut) {
      throw new Error("El correo ya esta registrado por otro usuario");
    }
  }

  async validateUserRelations(data = {}, currentData = null) {
    const { rolId, id_empresa, id_sucursal } = data;
    const targetEmpresaId =
      id_empresa !== undefined ? id_empresa : currentData?.id_empresa;
    const targetSucursalId =
      id_sucursal !== undefined ? id_sucursal : currentData?.id_sucursal;

    if (rolId !== undefined) {
      if (rolId === null) {
        throw new Error("El rol del usuario no puede ser nulo");
      }

      const rol = await RolesRepository.findById(rolId);
      if (!rol) {
        throw new Error("El rol especificado no existe");
      }
    }

    if (id_empresa !== undefined && id_empresa === null) {
      throw new Error("La empresa del usuario no puede ser nula");
    }

    if (targetEmpresaId !== undefined && targetEmpresaId !== null) {
      const empresa = await EmpresaRepository.getEmpresaById(targetEmpresaId);
      if (!empresa) {
        throw new Error("La empresa especificada no existe");
      }
    }

    if (targetSucursalId !== undefined && targetSucursalId !== null) {
      const sucursal = await SucursalRepository.getSucursalById(targetSucursalId);
      if (!sucursal) {
        throw new Error("La sucursal especificada no existe");
      }

      if (
        targetEmpresaId !== undefined &&
        targetEmpresaId !== null &&
        sucursal.id_empresa !== targetEmpresaId
      ) {
        throw new Error("La sucursal no pertenece a la empresa especificada");
      }
    }
  }

  async validatePasswordAgainstPolicy(password) {
    const settings = await SecuritySettingsService.getSettings();
    const minLength = settings?.password_min_length ?? 8;

    if (!password || password.length < minLength) {
      throw new Error(
        `La contraseña debe tener al menos ${minLength} caracteres`
      );
    }

    if (settings?.password_require_number && !/\d/.test(password)) {
      throw new Error("La contraseña debe incluir al menos un numero");
    }

    if (settings?.password_require_special && !/[^A-Za-z0-9]/.test(password)) {
      throw new Error("La contraseña debe incluir al menos un caracter especial");
    }
  }

  async generateTemporaryPassword() {
    const settings = await SecuritySettingsService.getSettings();
    const minLength = Math.max(settings?.password_min_length ?? 8, 8);
    const specialChars = "!@#$%^&*";
    const baseChars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    let passwordParts = ["Aa"];

    if (settings?.password_require_number) {
      passwordParts.push(String(crypto.randomInt(0, 10)));
    }

    if (settings?.password_require_special) {
      passwordParts.push(
        specialChars[crypto.randomInt(0, specialChars.length)]
      );
    }

    const currentLength = passwordParts.join("").length;
    const remainingLength = Math.max(minLength - currentLength, 0);
    const randomChars = Array.from({ length: remainingLength }, () =>
      baseChars[crypto.randomInt(0, baseChars.length)]
    ).join("");

    passwordParts.push(randomChars);

    return passwordParts.join("");
  }

  /**
   * @param {Object} data - Datos del usuario.
   * @returns {Promise<Object>} - Retorna el usuario creado.
   */
  async createUsuario(data) {
    const { rut, nombre, apellido, email, rolId, id_empresa, id_sucursal } =
      data;

    const usuario_existente = await UsuariosRepository.findByRut(rut);
    if (usuario_existente) {
      throw new Error("El usuario ya existe en el sistema");
    }
    await this.validateEmailAvailability(email);
    await this.validateUserRelations({ rolId, id_empresa, id_sucursal });

    const tempPassword = await this.generateTemporaryPassword();
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

    return this.sanitizeUser(usuario);
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

    await this.validateEmailAvailability(email);
    await this.validateUserRelations({ rolId, id_empresa, id_sucursal });
    await this.validatePasswordAgainstPolicy(password);

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

    return this.sanitizeUser(usuario);
  }

  async getAllUsuarios(filters = {}, options) {
    const where = createFilter(filters, { textFields: ["rut"] });
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
      attributes: { exclude: ["password", "refreshTokens"] },
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

    return this.sanitizeUser(usuario);
  }

  async getUsuarioById(rut) {
    const usuario = await UsuariosRepository.findOne(rut);
    return this.sanitizeUser(usuario);
  }

  /**
   * Actualizar un usuario.
   */
  async updateUsuario(rut, data) {
    const usuario = await UsuariosRepository.findByRut(rut);
    if (!usuario) {
      throw new Error(
        "No se pudo actualizar el usuario, posiblemente no existe..."
      );
    }

    const updateData = this.pickAllowedFields(data, this.ADMIN_UPDATE_FIELDS);
    if (Object.keys(updateData).length === 0) {
      throw new Error("No hay campos validos para actualizar");
    }

    await this.validateEmailAvailability(updateData.email, rut);
    await this.validateUserRelations(updateData, usuario);

    const result = await UsuariosRepository.update(rut, updateData);

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
      await this.validatePasswordAgainstPolicy(newPassword);
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

    const newTempPassword = await this.generateTemporaryPassword();

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newTempPassword, saltRounds);

    await UsuariosRepository.update(rut, { password: hashedPassword });

    return { usuario: this.sanitizeUser(usuario), newTempPassword };
  }

  async updateUserById(rut, updateData) {
    try {
      const usuario = await UsuariosRepository.findByRut(rut);

      if (!usuario) {
        throw new Error("El usuario no existe.");
      }

      const safeUpdateData = this.pickAllowedFields(
        updateData,
        this.SELF_UPDATE_FIELDS
      );

      if (Object.keys(safeUpdateData).length === 0) {
        throw new Error("No hay campos validos para actualizar");
      }

      await this.validateEmailAvailability(safeUpdateData.email, rut);
      await this.validateUserRelations(safeUpdateData, usuario);
      await UsuariosRepository.update(rut, safeUpdateData);

      const usuarioActualizado = await UsuariosRepository.findByRut(rut);

      if (!usuarioActualizado) {
        throw new Error(
          "No se pudo actualizar el usuario, posiblemente no existe."
        );
      }

      return {
        message: "Usuario actualizado exitosamente.",
        usuario: this.sanitizeUser(usuarioActualizado),
      };
    } catch (error) {
      console.error("Error al actualizar el usuario:", error.message);
      throw error;
    }
  }

  async updatePassword(rut, newPassword) {
    const usuario = await UsuariosRepository.findByRut(rut);

    if (!usuario) {
      return false;
    }

    await this.validatePasswordAgainstPolicy(newPassword);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UsuariosRepository.update(rut, { password: hashedPassword });
    return true;
  }
}

export default new UsuarioService();
