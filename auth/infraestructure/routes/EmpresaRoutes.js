import express from "express";
import EmpresaController from "../../infraestructure/controllers/EmpresaController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", checkPermissions("auth.empresa.ver"), EmpresaController.getAllEmpresas);
router.get("/:id" ,checkPermissions("auth.empresa.ver"), EmpresaController.getEmpresaById);
router.get("/buscar",checkPermissions("auth.empresa.ver"), EmpresaController.getEmpresaByNombre);
router.get("/usuario/:rutUsuario",checkPermissions("auth.empresa.ver"), EmpresaController.getEmpresaByUsuario);
router.put("/:id", checkPermissions("auth.empresa.editar"), EmpresaController.updateEmpresa);

export default router;
