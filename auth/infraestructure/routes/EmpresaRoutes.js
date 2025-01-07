import express from "express";
import EmpresaController from "../../infraestructure/controllers/EmpresaController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import verifyToken from "../../../shared/middlewares/VerifyTokenMiddleware.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", authenticate, EmpresaController.getAllEmpresas);
router.get("/:id", authenticate,EmpresaController.getEmpresaById);
router.get("/buscar", authenticate, EmpresaController.getEmpresaByNombre);
router.get("/usuario/:rutUsuario", authenticate, EmpresaController.getEmpresaByUsuario);
router.put("/:id", authenticate, EmpresaController.updateEmpresa);

export default router;
