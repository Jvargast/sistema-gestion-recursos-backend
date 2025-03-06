import { Router } from "express";
import InventarioCamionController from "../controllers/InventarioCamionController.js";

const router = Router();

router.post("/", InventarioCamionController.addProduct); 
router.get("/disponible/chofer", InventarioCamionController.getInventarioDisponiblePorChofer); 
router.get("/disponible/:id_camion", InventarioCamionController.getInventarioDisponible); 
router.get("/inventario/chofer/:id_chofer", InventarioCamionController.getInventarioPorChofer);
router.get("/estado/:id_camion", InventarioCamionController.getEstadoInventarioCamion);
router.post("/return/:id", InventarioCamionController.returnProducts); 
router.get("/:id", InventarioCamionController.getProductsByCamion); 


export default router;
