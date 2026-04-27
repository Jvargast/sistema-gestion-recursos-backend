import SecuritySettingsRepository from "../infraestructure/repositories/SecuritySettingsRepository.js";

class SecuritySettingsService {
  async getSettings() {
    return await SecuritySettingsRepository.getSettings();
  }

  async updateSettings(updates) {
    if (
      updates.password_min_length !== undefined &&
      updates.password_min_length < 6
    ) {
      throw new Error("La longitud mínima de la contraseña debe ser al menos 6.");
    }

    if (
      updates.max_login_attempts !== undefined &&
      updates.max_login_attempts < 1
    ) {
      throw new Error("max_login_attempts debe ser al menos 1.");
    }

    if (
      updates.lockout_duration !== undefined &&
      updates.lockout_duration < 1
    ) {
      throw new Error("lockout_duration debe ser al menos 1 minuto.");
    }

    return await SecuritySettingsRepository.updateSettings(updates);
  }
}

export default new SecuritySettingsService();
