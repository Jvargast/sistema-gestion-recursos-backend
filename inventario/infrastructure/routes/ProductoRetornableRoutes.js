import { Router } from "express";
import ProductoRetornableController from "../controllers/ProductoRetonableController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = Router();

// Obtener un producto retornable por ID
router.get("/:id", authenticate, checkPermissions("ver_producto_retornable"), ProductoRetornableController.getProductoRetornableById);

// Obtener todos los productos retornables
router.post("/", authenticate, checkPermissions("ver_productos_retornables"), ProductoRetornableController.getAllProductosRetornables);

// Crear un nuevo producto retornable
router.post("/create", authenticate, checkPermissions("crear_producto_retornable"), ProductoRetornableController.createProductoRetornable);

// Actualizar un producto retornable
router.put("/:id", authenticate, checkPermissions("editar_producto_retornable"), ProductoRetornableController.updateProductoRetornable);

// Eliminar un producto retornable
router.delete("/:id", authenticate, checkPermissions("borrar_producto_retornable"), ProductoRetornableController.deleteProductoRetornable);

export default router;
