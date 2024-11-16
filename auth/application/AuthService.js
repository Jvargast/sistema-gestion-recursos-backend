import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UsuariosRepository from '../infraestructure/repositories/UsuariosRepository.js';

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
      throw new Error('Credenciales inválidas o usuario inactivo');
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // Generar el token JWT
    const token = jwt.sign(
      { rut: usuario.rut, rolId: usuario.rolId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return token;
  }
}

export default new AuthService();