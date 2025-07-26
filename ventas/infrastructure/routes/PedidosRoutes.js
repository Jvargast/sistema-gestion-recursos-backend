import { Router } from "express";
import authenticate from "../../../shared/middlewares/authenticate.js";
import PedidoController from "../controllers/PedidoController.js";
import { checkRoles } from "../../../shared/middlewares/CheckRole.js";
import checkPermissions from "../../../shared/middlewares/CheckPermissionsMiddleware.js";

const router = Router();
router.use(authenticate);

router.get(
  "/asignados/:id_chofer",
  checkPermissions("ventas.pedido.asignados"),
  PedidoController.obtenerPedidosAsignados
);
router.get(
  "/sin-asignar",
  checkPermissions("ventas.pedido.noasignados"),
  PedidoController.obtenerPedidosSinAsignar
);
router.get(
  "/detalle-con-total/:id_pedido",
  checkPermissions("ventas.pedido.ver"),
  PedidoController.obtenerPedidosConTotal
);
router.get(
  "/mis-pedidos",
  checkPermissions("ventas.pedido.propios"),
  PedidoController.obtenerMisPedidos
);
router.get(
  "/historial",
  checkPermissions("ventas.pedido.historial"),
  PedidoController.obtenerHistorialPedidos
);
router.get(
  "/confirmados/:id_chofer",
  checkPermissions("ventas.pedido.confirmados"),
  PedidoController.obtenerPedidosConfirmados
);
router.get(
  "/:id_pedido",
  checkPermissions("ventas.pedido.ver"),
  PedidoController.getPedidoById
);
router.get(
  "/",
  checkPermissions("ventas.pedido.ver"),
  PedidoController.getAllPedidos
);
router.put(
  "/asignar/:id_pedido",
  checkPermissions("ventas.pedido.asignar"),
  PedidoController.asignarPedido
);
router.put(
  "/desasignar/:id_pedido",
  checkPermissions("ventas.pedido.desasignar"),
  PedidoController.desasignarPedido
);
router.post(
  "/",
  checkPermissions("ventas.pedido.crear"),
  PedidoController.createPedido
);
router.post(
  "/registrar-desde-pedido",
  checkPermissions("ventas.pedido.pago"),
  PedidoController.registrarDesdePedido
);
router.post(
  "/:id/revertir-estado",
  checkPermissions("ventas.pedido.editar"),
  PedidoController.revertirPedidoAEstado
);
router.patch(
  "/:id_pedido/confirmacion",
  checkPermissions("ventas.pedido.confirmar"),
  checkRoles(["chofer"]),
  PedidoController.confirmarPedido
);
router.put(
  "/:id_pedido/rechazar",
  checkPermissions("ventas.pedido.confirmar"),
  PedidoController.rechazarPedido
);
router.put(
  "/:id_pedido/revertir",
  checkPermissions("ventas.pedido.editar"),
  PedidoController.revertirPedido
);
router.delete(
  "/:id_pedido",
  checkPermissions("ventas.pedido.eliminar"),
  PedidoController.eliminarPedido
);

export default router;
