import { Router } from "express";
import InsumoController from "../controllers/InsumoController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";
import multer from "multer";

const router = Router();
router.use(authenticate);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/images"),
  filename: (req, file, cb) => {
    const name = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.\-_]/g, "");
    cb(null, `${Date.now()}-${name}`);
  },
});
const upload = multer({ storage });

router.get(
  "/",
  checkPermissions("inventario.insumo.ver"),
  InsumoController.getAllInsumos
);
router.get(
  "/stock",
  checkPermissions("inventario.insumo.ver"),
  InsumoController.getStocksForInsumos
);
router.get(
  "/stock/by-formula",
  checkPermissions("inventario.insumo.ver"),
  InsumoController.getStocksByFormula
);

router.get(
  "/all",
  checkPermissions("inventario.insumo.ver"),
  InsumoController.getAllInsumosAll
);
router.get(
  "/vendibles",
  checkPermissions("inventario.insumo.disponible"),
  InsumoController.getAllInsumosVendibles
);
router.get(
  "/:id",
  checkPermissions("inventario.insumo.ver"),
  InsumoController.getInsumoById
);
router.post(
  "/",
  checkPermissions("inventario.insumo.crear"),
  InsumoController.createInsumo
);
router.put(
  "/:id",
  checkPermissions("inventario.insumo.editar"),
  upload.single("image"),
  InsumoController.updateInsumo
);
router.delete(
  "/",
  checkPermissions("inventario.insumo.eliminar"),
  InsumoController.deleteInsumo
);

export default router;
