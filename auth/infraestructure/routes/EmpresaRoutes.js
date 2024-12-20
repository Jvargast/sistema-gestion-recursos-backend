import express from "express";
import EmpresaController from "../../infraestructure/controllers/EmpresaController.js";

const router = express.Router();

router.get("/", EmpresaController.getAllEmpresas);
router.get("/:id", EmpresaController.getEmpresaById);
router.get("/buscar", EmpresaController.getEmpresaByNombre);
router.get("/usuario/:rutUsuario", EmpresaController.getEmpresaByUsuario);
router.put("/:id", EmpresaController.updateEmpresa);

export default router;
