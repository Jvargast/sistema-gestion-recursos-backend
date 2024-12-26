import SecuritySettingsRepository from "../infraestructure/repositories/SecuritySettingsRepository.js";

class SecuritySettingsService {
  async getSettings() {
    return await SecuritySettingsRepository.getSettings();
  }

  async updateSettings(updates) {
    // Validaciones de negocio, por ejemplo:
    if (updates.password_min_length < 6) {
      throw new Error("La longitud mínima de la contraseña debe ser al menos 6.");
    }
    return await SecuritySettingsRepository.updateSettings(updates);
  }
}

export default new SecuritySettingsService();
