import { Router } from "express";
import SecuritySettingsController from "../controllers/SecuritySettingsController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";

const router = Router();

router.get("/", authenticate, SecuritySettingsController.getSettings);
router.put("/", authenticate, SecuritySettingsController.updateSettings);

export default router;
