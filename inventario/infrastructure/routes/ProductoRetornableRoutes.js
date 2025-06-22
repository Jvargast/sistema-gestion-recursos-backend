import { Router } from "express";
import ProductoRetornableController from "../controllers/ProductoRetonableController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = Router();
router.use(authenticate)

router.get("/:id", checkPermissions("inventario.productoretornable.ver"), ProductoRetornableController.getProductoRetornableById);
router.post("/", checkPermissions("inventario.productoretornable.ver"), ProductoRetornableController.getAllProductosRetornables);
router.post("/create", checkPermissions("inventario.productoretornable.crear"), ProductoRetornableController.createProductoRetornable);
router.put("/:id", checkPermissions("inventario.productoretornable.editar"), ProductoRetornableController.updateProductoRetornable);
router.delete("/:id", checkPermissions("inventario.productoretornable.eliminar"), ProductoRetornableController.deleteProductoRetornable);
router.post(
  "/inspeccionar/:id_camion",
  checkPermissions("inventario.productoretornable.editar"),
  ProductoRetornableController.inspeccionarRetornables
);

export default router;
