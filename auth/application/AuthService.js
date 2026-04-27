import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UsuariosRepository from "../infraestructure/repositories/UsuariosRepository.js";

class AuthService {
  MAX_REFRESH_TOKENS = 5;

  ensureUserCanAuthenticate(usuario) {
    if (!usuario || !usuario.activo) {
      throw new Error("Credenciales inválidas o usuario inactivo");
    }

    if (
      usuario.fecha_expiracion &&
      new Date(usuario.fecha_expiracion).getTime() <= Date.now()
    ) {
      throw new Error("La cuenta ha expirado");
    }
  }

  createAccessToken(usuario) {
    return jwt.sign(
      { rut: usuario.rut, rolId: usuario.rolId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  }

  createRefreshToken(usuario) {
    return jwt.sign(
      { rut: usuario.rut, rolId: usuario.rolId },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );
  }

  parseStoredRefreshTokens(refreshTokens) {
    if (!refreshTokens) return [];

    if (Array.isArray(refreshTokens)) {
      return refreshTokens.filter((token) => typeof token === "string");
    }

    if (typeof refreshTokens !== "string") {
      return [];
    }

    try {
      const parsed = JSON.parse(refreshTokens);
      if (Array.isArray(parsed)) {
        return parsed.filter((token) => typeof token === "string");
      }
    } catch (_error) {
      // Mantiene compatibilidad con el formato histórico de string plano.
    }

    return [refreshTokens];
  }

  serializeRefreshTokens(tokens) {
    return JSON.stringify(
      [...new Set(tokens)].filter((token) => typeof token === "string" && token)
    );
  }

  /**
   * 
   * @param {string} rut 
   * @param {string} password 
   * @returns {Promise<string>} 
   */
  async login(rut, password) {
    if (!rut || !password) {
      throw new Error("Debes proporcionar rut y contraseña.");
    }

    const usuario = await UsuariosRepository.findByRut(rut);

    this.ensureUserCanAuthenticate(usuario);

    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      throw new Error("Usuario o contraseña incorrectos.");
    }

    const now = new Date();

    await UsuariosRepository.updateLastLogin(usuario.rut, now);

    const token = this.createAccessToken(usuario);
    const refreshToken = this.createRefreshToken(usuario);

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

    this.ensureUserCanAuthenticate(user);

    if (!user.rol) {
      throw new Error("El usuario no tiene un rol asignado");
    }

    const permisos = [...new Set(
      (user.rol.rolesPermisos || []).map((rp) => rp?.permiso?.nombre).filter(Boolean)
    )];

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

      try {
        this.ensureUserCanAuthenticate(user);
      } catch (_error) {
        return false;
      }
      const storedTokens = this.parseStoredRefreshTokens(user.refreshTokens);
      const tokenIsValid = storedTokens.includes(token);

      return tokenIsValid;
    } catch (error) {
      console.error("Error al verificar el Refresh Token:", error.message);
      return false;
    }
  }

  async saveRefreshToken(rut, token) {
    try {
      const user = await UsuariosRepository.findByRut(rut);
      if (!user) {
        console.error(`Usuario ${rut} no encontrado al guardar el Refresh Token`);
        return false;
      }

      const storedTokens = this.parseStoredRefreshTokens(user.refreshTokens);
      const refreshTokens = this.serializeRefreshTokens(
        [...storedTokens, token].slice(-this.MAX_REFRESH_TOKENS)
      );

      const result = await UsuariosRepository.update(rut, {
        refreshTokens,
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

  async removeRefreshToken(userId, token = null) {
    try {
      let refreshTokens = null;

      if (token) {
        const user = await UsuariosRepository.findByRut(userId);
        if (!user) {
          return false;
        }

        const remainingTokens = this.parseStoredRefreshTokens(
          user.refreshTokens
        ).filter((storedToken) => storedToken !== token);

        refreshTokens =
          remainingTokens.length > 0
            ? this.serializeRefreshTokens(remainingTokens)
            : null;
      }

      const result = await UsuariosRepository.update(userId, {
        refreshTokens,
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

  async refreshAccessToken(refreshToken) {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const isTokenValid = await this.isValidRefreshToken(refreshToken, decoded.rut);
    if (!isTokenValid) {
      throw new Error("Refresh token inválido");
    }

    const user = await UsuariosRepository.findByRut(decoded.rut);
    this.ensureUserCanAuthenticate(user);

    return this.createAccessToken(user);
  }

  async listUserPermissions(rut) {
    const user = await UsuariosRepository.findOne(rut);

    try {
      this.ensureUserCanAuthenticate(user);
    } catch (_error) {
      return null;
    }

    if (!user.rol) {
      return null;
    }

    return {
      rol: user.rol.nombre,
      permisos: [...new Set(
        (user.rol.rolesPermisos || [])
          .map((rolePermission) => rolePermission?.permiso?.nombre)
          .filter(Boolean)
      )],
    };
  }
}

export default new AuthService();
