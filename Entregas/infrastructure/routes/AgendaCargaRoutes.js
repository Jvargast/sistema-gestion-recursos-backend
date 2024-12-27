import { Router } from "express";
import AgendaController from "../controllers/AgendaController.js";

const router = Router();

router.post("/", AgendaController.create);
router.get('/:id', AgendaController.getById);
router.get("/", AgendaController.getAll);
router.put('/:id', AgendaController.update); // Actualizar una agenda
router.delete('/:id', AgendaController.delete); 

export default router;