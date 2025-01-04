import { Router } from "express";
import CamionController from "../controllers/CamionController.js";

const router = Router();

router.post("/", CamionController.create);
router.get("/", CamionController.getAll);
router.get("/capacidad/:id_camion", CamionController.getCamionCapacity)
router.get("/:id", CamionController.getById);
router.put("/:id", CamionController.update);
router.delete("/:id", CamionController.delete);

export default router;