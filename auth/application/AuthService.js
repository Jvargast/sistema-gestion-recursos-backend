import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UsuariosRepository from "../infraestructure/repositories/UsuariosRepository.js";

class AuthService {
  /**
   * Iniciar sesión: validar credenciales y generar un token JWT.
   * @param {string} rut - Rut del usuario.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<string>} - Token JWT.
   */
  async login(rut, password) {
    // Buscar el usuario por rut
    const usuario = await UsuariosRepository.findByRut(rut);

    if (!usuario || !usuario.activo) {
      throw new Error("Credenciales inválidas o usuario inactivo");
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      throw new Error("Usuario o contraseña incorrectos.");
    }

    const now = new Date();

    await UsuariosRepository.updateLastLogin(usuario.rut, now);

    // Generar el token JWT
    const token = jwt.sign(
      { rut: usuario.rut, rolId: usuario.rolId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { rut: usuario.rut },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" } // Refresh Token válido por 7 días
    );

    // Guardar el Refresh Token en la base de datos
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
    // El token decodificado contiene la información del usuario (por ejemplo, ID)
    const { rut } = decodedToken;

    if (!rut) {
      throw new Error("El token no contiene un ID válido");
    }

    // Buscar el usuario en la base de datos
    const user = await UsuariosRepository.findOne(rut);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    // Extraer permisos desde RolesPermisos
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
      // Decodificar el token para obtener el ID del usuario
      const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

      // Verificar que el ID del usuario en el token coincida con el userId proporcionado
      if (decoded.rut !== userId) {
        return false;
      }

      // Consultar la base de datos para verificar si el token está almacenado y activo
      const user = await UsuariosRepository.findByRut(userId);

      if (!user) {
        return false; // Usuario no encontrado
      }
      // Comprobar si el token existe en la lista de tokens válidos del usuario
      const tokenIsValid = user.refreshTokens.includes(token);

      return tokenIsValid;
    } catch (error) {
      console.error("Error al verificar el Refresh Token:", error.message);
      return false;
    }
  }

  async saveRefreshToken(rut, token) {
    try {
      // Actualizar el campo refreshToken del usuario
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
