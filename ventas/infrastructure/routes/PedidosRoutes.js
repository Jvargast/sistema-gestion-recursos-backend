import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import PedidoController from "../controllers/PedidoController.js";
import { checkRoles } from "../../../shared/middlewares/CheckRole.js";

const router = Router();

router.get("/asignados/:id_chofer", authenticate, PedidoController.obtenerPedidosAsignados);
router.get("/sin-asignar", authenticate, PedidoController.obtenerPedidosSinAsignar);
router.get('/detalle-con-total/:id_pedido', authenticate, PedidoController.obtenerPedidosConTotal);
router.get("/mis-pedidos", authenticate, PedidoController.obtenerMisPedidos);
router.get("/historial", authenticate, PedidoController.obtenerHistorialPedidos);
router.get("/confirmados/:id_chofer", authenticate, PedidoController.obtenerPedidosConfirmados);
router.get("/:id_pedido", authenticate, PedidoController.getPedidoById);
router.get("/", authenticate, PedidoController.getAllPedidos);
router.put("/asignar/:id_pedido", authenticate, PedidoController.asignarPedido);
router.put("/desasignar/:id_pedido", authenticate, PedidoController.desasignarPedido);
router.post("/", authenticate, PedidoController.createPedido);
router.post("/registrar-desde-pedido", authenticate, PedidoController.registrarDesdePedido);
router.patch("/:id_pedido/confirmacion", authenticate, checkRoles(['chofer']), PedidoController.confirmarPedido);


export default router;
