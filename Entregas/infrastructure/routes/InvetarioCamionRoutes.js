import { Router } from "express";
import InventarioCamionController from "../controllers/InventarioCamionController.js";

const router = Router();

router.post("/", InventarioCamionController.addProduct);
router.get("/disponible", InventarioCamionController.getInventarioDisponible);
router.get("/disponible/chofer", InventarioCamionController.getInventarioDisponiblePorChofer);
router.get("/:id", InventarioCamionController.getProductsByCamion);
router.post("/return/:id", InventarioCamionController.returnProducts);

export default router;
