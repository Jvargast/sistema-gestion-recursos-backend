import { Router } from "express";
import InventarioCamionController from "../controllers/InventarioCamionController.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";
import authenticate from "../../../shared/middlewares/authenticate.js";

const router = Router();
router.use(authenticate);

router.post("/",checkPermissions("entregas.inventariocamion.agregar") ,InventarioCamionController.addProduct); 
router.get("/disponible/chofer", checkPermissions("entregas.inventariocamion.disponible.porchofer"),InventarioCamionController.getInventarioDisponiblePorChofer); 
router.get("/disponible/:id_camion", checkPermissions("entregas.inventariocamion.disponible"),InventarioCamionController.getInventarioDisponible); 
router.get("/inventario/chofer/:id_chofer", checkPermissions("entregas.inventariocamion.porchofer"), InventarioCamionController.getInventarioPorChofer);
router.get("/estado/:id_camion", checkPermissions("entregas.inventariocamion.estado"), InventarioCamionController.getEstadoInventarioCamion);
router.post("/return/:id", checkPermissions(""), InventarioCamionController.returnProducts);
router.get("/:id", checkPermissions("entregas.inventariocamion.ver"),InventarioCamionController.getProductsByCamion);
router.post(
  "/vaciar/:id_camion",
  checkPermissions("entregas.inventariocamion.estado"),
  InventarioCamionController.vaciarCamion
);


export default router;
