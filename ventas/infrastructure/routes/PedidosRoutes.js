import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import PedidoController from "../controllers/PedidoController.js";

const router = Router();

router.get("/:id_pedido", authenticate, PedidoController.getPedidoById);
router.get("/", authenticate, PedidoController.getAllPedidos);
router.post("/", authenticate, PedidoController.createPedido);
router.put("/:id_pedido/estado", authenticate, PedidoController.actualizarEstado);
router.put("/:id_pedido/asignar", authenticate, PedidoController.asignarPedido);
router.delete("/:id_pedido", authenticate,PedidoController.eliminarPedido);

export default router;
