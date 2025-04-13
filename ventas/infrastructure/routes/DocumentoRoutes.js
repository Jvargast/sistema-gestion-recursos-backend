import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import DocumentoController from "../controllers/DocumentoController.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";


const router = Router();
router.use(authenticate);

router.get("/:id", checkPermissions("ventas.documento.ver"), DocumentoController.getDocumentoById);
router.get("/venta/:id_venta", checkPermissions("ventas.documento.ver"), DocumentoController.getDocumentosByVenta);
router.post("/", checkPermissions("ventas.documento.crear"), DocumentoController.createDocumento);
router.put("/:id", checkPermissions("ventas.documento.editar"), DocumentoController.updateDocumento);
router.delete("/:id", checkPermissions("ventas.documento.eliminar"), DocumentoController.deleteDocumento);

export default router;
