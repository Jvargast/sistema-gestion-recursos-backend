import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import DocumentoController from "../controllers/DocumentoController.js";


const router = Router();

router.use(authenticate);
router.get("/:id", DocumentoController.getDocumentoById);
router.get("/venta/:id_venta", DocumentoController.getDocumentosByVenta);
router.post("/", DocumentoController.createDocumento);
router.put("/:id", DocumentoController.updateDocumento);
router.delete("/:id", DocumentoController.deleteDocumento);

export default router;
