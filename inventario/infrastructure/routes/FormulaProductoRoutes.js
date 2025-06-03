import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";
import FormulaProductoController from "../controllers/FormulaProductoController.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  /* checkPermissions("produccion.formula.ver"), */
  FormulaProductoController.getAllFormulas
);

router.get(
  "/producto/:id_producto",
  /* checkPermissions("produccion.formula.ver"), */
  FormulaProductoController.getFormulasByProductoId
);

router.get(
  "/:id",
  /* checkPermissions("produccion.formula.ver"), */
  FormulaProductoController.getFormulaById
);

router.post(
  "/",
  /* checkPermissions("produccion.formula.crear"), */
  FormulaProductoController.createFormula
);

router.put(
  "/:id",
  /* checkPermissions("produccion.formula.editar"), */
  FormulaProductoController.updateFormula
);

router.delete(
  "/:id",
  /* checkPermissions("produccion.formula.eliminar"), */
  FormulaProductoController.deleteFormula
);

export default router;
