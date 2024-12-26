import SecuritySettings from "../../domain/models/SecuritySettings.js";

class SecuritySettingsRepository {
  async getSettings() {
    return await SecuritySettings.findOne();
  }

  async updateSettings(updates) {
    const settings = await SecuritySettings.findOne();
    if (settings) {
      return await settings.update(updates);
    }
    throw new Error("No se encontraron configuraciones de seguridad.");
  }
}

export default new SecuritySettingsRepository();
