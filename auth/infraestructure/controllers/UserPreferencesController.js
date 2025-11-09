import UserPreferencesService from "../../application/UserPreferencesService.js";

class UserPreferencesController {

  async getMine(req, res) {
    try {
      const currentUser = {
        rut: req.user?.rut || req.user?.id,
        rol: req.user?.rol, 
      };

      if (!currentUser.rut) {
        return res.status(401).json({ error: "Usuario no autenticado." });
      }

      const data = await UserPreferencesService.getMine(currentUser);
      return res.status(200).json(data);
    } catch (error) {
      const status = error.status || 500;
      return res
        .status(status)
        .json({ error: error.message || "Error interno del servidor." });
    }
  }

  async saveMine(req, res) {
    try {
      const currentUser = {
        rut: req.user?.rut || req.user?.id,
        rol: req.user?.rol,
      };

      if (!currentUser.rut) {
        return res.status(401).json({ error: "Usuario no autenticado." });
      }

      const payload = {
        preferred_vendor_rut: req.body?.preferred_vendor_rut,
        preferred_branch_id: req.body?.preferred_branch_id,
        preferred_cashbox_id: req.body?.preferred_cashbox_id,
        pos_sticky: req.body?.pos_sticky,
      };

      const data = await UserPreferencesService.saveMine(currentUser, payload);
      return res.status(200).json(data);
    } catch (error) {
      const status =
        error.status ||
        (/inválido|invalido|no existe|pertenece/i.test(error.message)
          ? 400
          : 500);
      return res
        .status(status)
        .json({ error: error.message || "Error interno del servidor." });
    }
  }

  async clearMine(req, res) {
    try {
      const currentUser = {
        rut: req.user?.rut || req.user?.id,
        rol: req.user?.rol,
      };

      if (!currentUser.rut) {
        return res.status(401).json({ error: "Usuario no autenticado." });
      }

      const data = await UserPreferencesService.saveMine(currentUser, {
        preferred_vendor_rut: null,
        preferred_branch_id: null,
        preferred_cashbox_id: null,
      });

      return res.status(200).json({
        message: "Preferencias restablecidas.",
        ...data,
      });
    } catch (error) {
      const status = error.status || 500;
      return res
        .status(status)
        .json({ error: error.message || "Error interno del servidor." });
    }
  }
}

export default new UserPreferencesController();
