import { Router } from "express";
import SecuritySettingsController from "../controllers/SecuritySettingsController.js";

const router = Router();

router.get("/", SecuritySettingsController.getSettings);
router.put("/", SecuritySettingsController.updateSettings);

export default router;
