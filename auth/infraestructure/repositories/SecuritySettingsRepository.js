import SecuritySettings from "../../domain/models/SecuritySettings.js";

class SecuritySettingsRepository {
  async getSettings() {
    const [settings] = await SecuritySettings.findOrCreate({
      where: { id: 1 },
      defaults: { id: 1 },
    });
    return settings;
  }

  async updateSettings(updates) {
    const settings = await this.getSettings();
    return await settings.update(updates);
  }
}

export default new SecuritySettingsRepository();
