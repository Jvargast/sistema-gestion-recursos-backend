import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UsuariosRepository from "../infraestructure/repositories/UsuariosRepository.js";

class AuthService {
  /**
   * 
   * @param {string} rut 
   * @param {string} password 
   * @returns {Promise<string>} 
   */
  async login(rut, password) {
    const usuario = await UsuariosRepository.findByRut(rut);

    if (!usuario || !usuario.activo) {
      throw new Error("Credenciales inválidas o usuario inactivo");
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      throw new Error("Usuario o contraseña incorrectos.");
    }

    const now = new Date();

    await UsuariosRepository.updateLastLogin(usuario.rut, now);

    const token = jwt.sign(
      { rut: usuario.rut, rolId: usuario.rolId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { rut: usuario.rut },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" } 
    );

    const saved = await this.saveRefreshToken(usuario.rut, refreshToken);

    if (!saved) {
      throw new Error("Error al guardar el Refresh Token");
    }
    return {
      token,
      usuario,
      refreshToken,
    };
  }

  async getUserFromToken(decodedToken) {
    const { rut } = decodedToken;

    if (!rut) {
      throw new Error("El token no contiene un ID válido");
    }

    const user = await UsuariosRepository.findOne(rut);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    const permisos = user.rol.rolesPermisos.map((rp) => rp.permiso.nombre);
    return {
      id: user.rut,
      nombre: user.nombre,
      apellido: user.apellido,
      id_sucursal: user.id_sucursal,
      email: user.email,
      rut: user.rut,
      activo: user.activo,
      rol: user.rol.nombre, 
      rolId: user.rolId,
      permisos,
      nombre_sucursal: user?.Sucursal?.nombre
    };
  }

  async isValidRefreshToken(token, userId) {
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

      if (decoded.rut !== userId) {
        return false;
      }

      const user = await UsuariosRepository.findByRut(userId);

      if (!user) {
        return false; 
      }
      const tokenIsValid = user.refreshTokens.includes(token);

      return tokenIsValid;
    } catch (error) {
      console.error("Error al verificar el Refresh Token:", error.message);
      return false;
    }
  }

  async saveRefreshToken(rut, token) {
    try {
      const result = await UsuariosRepository.update(rut, {
        refreshTokens: token,
      });

      if (result[0] === 0) {
        console.error(
          `Usuario ${rut} no encontrado al guardar el Refresh Token`
        );
        return false;
      }

      console.log(`Refresh Token guardado para usuario ${rut}`);
      return true;
    } catch (error) {
      console.error("Error al guardar el Refresh Token:", error.message);
      return false;
    }
  }

  async removeRefreshToken(userId) {
    try {
      const result = await UsuariosRepository.update(userId, {
        refreshTokens: null,
      });

      if (result[0] === 0) {
        console.error(
          `Usuario ${userId} no encontrado al eliminar el Refresh Token`
        );
        return false;
      }

      console.log(`Refresh Token eliminado para usuario ${userId}`);
      return true;
    } catch (error) {
      console.error("Error al eliminar el Refresh Token:", error.message);
      return false;
    }
  }
}

export default new AuthService();
