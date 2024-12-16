import { Router } from "express";
import EstadoDetallesController from "../controllers/EstadoDetallesController.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import verifyToken from "../../../shared/middlewares/VerifyTokenMiddleware.js";

const router = Router();

router.use(verifyToken);
router.get(
  "/",
  authenticate,
  EstadoDetallesController.getEstadosDetalle
);

export default router;
