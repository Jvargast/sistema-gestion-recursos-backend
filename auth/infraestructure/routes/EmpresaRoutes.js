import express from "express";
import EmpresaController from "../../infraestructure/controllers/EmpresaController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import verifyToken from "../../../shared/middlewares/VerifyTokenMiddleware.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", authenticate, checkPermissions("ver_empresas"), EmpresaController.getAllEmpresas);
router.get("/:id", authenticate,checkPermissions("ver_empresa"), EmpresaController.getEmpresaById);
router.get("/buscar", authenticate,checkPermissions("ver_empresa_nombre"), EmpresaController.getEmpresaByNombre);
router.get("/usuario/:rutUsuario", authenticate,checkPermissions("ver_empresa_usuario"), EmpresaController.getEmpresaByUsuario);
router.put("/:id", authenticate, checkPermissions("editar_empresa"), EmpresaController.updateEmpresa);

export default router;
