import { Router } from "express";
import ProductoController from "../controllers/ProductoController.js";
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
    const timestamp = Date.now();
    cb(null, `${timestamp}-${name}`);
  },
});

const upload = multer({ storage });

router.get(
  "/disponible",
  checkPermissions("inventario.producto.disponible"),
  ProductoController.getAvailableProductos
);
router.get(
  "/:id",
  checkPermissions("inventario.producto.ver"),
  ProductoController.getProductoById
);
router.get(
  "/",
  checkPermissions("inventario.producto.ver"),
  ProductoController.getAllProductos
);
router.post(
  "/",
  checkPermissions("inventario.producto.crear"),
  ProductoController.createProducto
);
router.put(
  "/:id",
  checkPermissions("inventario.producto.editar"),
  upload.single("image"),
  ProductoController.updateProducto
);
router.patch(
  "/",
  checkPermissions("inventario.producto.eliminar"),
  ProductoController.deleteProductos
);
router.delete(
  "/:id",
  checkPermissions("inventario.producto.eliminar"),
  ProductoController.deleteProducto
);

export default router;
