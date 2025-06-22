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

