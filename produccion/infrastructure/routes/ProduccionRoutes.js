import { Router } from "express";
import ProduccionController from "../controllers/ProduccionController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
// import checkPermissions from "../../middlewares/checkPermissions.js";  // si usas RBAC

const router = Router();

const produccionController = new ProduccionController();
router.use(authenticate)

/* body:
   {
     "id_formula": 3,
     "cantidad_lotes": 5             
   }
*/
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
