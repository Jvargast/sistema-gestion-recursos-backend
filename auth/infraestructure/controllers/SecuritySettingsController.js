import SecuritySettingsService from "../../application/SecuritySettingsService.js";

class SecuritySettingsController {
  async getSettings(req, res) {
    try {
      const settings = await SecuritySettingsService.getSettings();
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateSettings(req, res) {
    try {
      const updates = req.body;
      const updatedSettings = await SecuritySettingsService.updateSettings(updates);
      res.status(200).json(updatedSettings);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new SecuritySettingsController();
