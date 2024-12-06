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
      throw new Error("Credenciales inválidas");
    }

    const now = new Date();
    await UsuariosRepository.updateLastLogin(usuario.rut, now);

    // Generar el token JWT
    const token = jwt.sign(
      { rut: usuario.rut, rolId: usuario.rolId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return {
      token,
      usuario
    };
    /* return token; */
  }

  async getUserFromToken(decodedToken) {
    // El token decodificado contiene la información del usuario (por ejemplo, ID)
    const { rut } = decodedToken;

    if (!rut) {
      throw new Error("El token no contiene un ID válido");
    }

    // Buscar el usuario en la base de datos
    const user = await UsuariosRepository.findByRut(rut);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    return {
      id: user.id_usuario,
      nombre: user.nombre,
      email: user.email,
      rut: user.rut,
      activo: user.activo,
      rol: user.rol, // Asegúrate de incluir la relación del rol
    };
  }
}

export default new AuthService();
