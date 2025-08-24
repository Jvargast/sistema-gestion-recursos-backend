import { Router } from "express";
import ProduccionController from "../controllers/ProduccionController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
// import checkPermissions from "../../middlewares/checkPermissions.js";  // si usas RBAC

const router = Router();

const produccionController = new ProduccionController();
router.use(authenticate)

router.post(
  "/",
  /* checkPermissions("produccion.registrar"), */
  produccionController.registrarProduccion.bind(produccionController)
);

router.get(
  "/",
  /* checkPermissions("produccion.ver"), */
  produccionController.listarProducciones.bind(produccionController)
);

router.get(
  "/:id",
  /* checkPermissions("produccion.ver"), */
  produccionController.obtenerProduccion.bind(produccionController)
);

export default router;
