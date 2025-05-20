import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

/**
 * Hashea una contraseña con bcrypt.
 * @param {string} password Contraseña plana
 * @returns {Promise<string>} Contraseña hasheada
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compara una contraseña con su hash.
 * @param {string} plain Contraseña plana
 * @param {string} hash Hash almacenado
 * @returns {Promise<boolean>} Si coinciden
 */
export const comparePassword = async (plain, hash) => {
  return await bcrypt.compare(plain, hash);
};
