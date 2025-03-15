import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import PedidoController from "../controllers/PedidoController.js";
import { checkRoles } from "../../../shared/middlewares/CheckRole.js";

const router = Router();


router.get("/asignados/:id_chofer", authenticate, PedidoController.obtenerPedidosAsignados);
router.get("/sin-asignar", authenticate, PedidoController.obtenerPedidosSinAsignar);
router.get("/mis-pedidos", authenticate, checkRoles(['chofer']), PedidoController.obtenerMisPedidos);
router.get("/confirmados", authenticate, checkRoles(['chofer']), PedidoController.obtenerPedidosConfirmados);
router.get("/:id_pedido", authenticate, PedidoController.getPedidoById);
router.get("/", authenticate, PedidoController.getAllPedidos);
router.post("/", authenticate, PedidoController.createPedido);
router.patch("/:id_pedido/confirmacion", authenticate, checkRoles(['chofer']), PedidoController.confirmarPedido);


export default router;
