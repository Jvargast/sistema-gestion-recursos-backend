import { Router } from "express";
import verifyToken from "../../../shared/middlewares/VerifyTokenMiddleware.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import PagosController from "../controllers/PagosController.js";

const router = Router();

router.use(verifyToken);

router.post("/:id/completar-pago", PagosController.completarPago)

export default router;