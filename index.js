import express from "express";
import bodyParser from "body-parser";
import initializeDatabase from "./database/db-init.js";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io"; 

/**
 * Implementación de tareas
 */
/* import setupAnalysisCronJobs from "./analisis/infrastructure/cron/analysisCronJobs.js"; */
// Rutas para arquitectura hexagonal
/* MÓDULO AUTH */
import AuthRoutes from "./auth/infraestructure/routes/AuthRoutes.js";
import UsuariosRoutes from "./auth/infraestructure/routes/UsuariosRoutes.js";
import EmpresaRoutes from "./auth/infraestructure/routes/EmpresaRoutes.js";
import RolRoutes from "./auth/infraestructure/routes/RolRoutes.js";
import PermisosRoutes from "./auth/infraestructure/routes/PermisosRoutes.js";
import AuditLogsRoutes from "./auth/infraestructure/routes/AuditLogsRoutes.js";
import SecuritySettingsRoutes from "./auth/infraestructure/routes/SecuritySettingsRoutes.js";
import SucursalesRoutes from "./auth/infraestructure/routes/SucursalesRoutes.js";
/* MÓDULO INVENTARIO */
import EstadoProductoRoutes from "./inventario/infrastructure/routes/EstadoProductoRoutes.js";
import CategoriaProductoRoutes from "./inventario/infrastructure/routes/CategoriaProductoRoutes.js";
import InventarioRoutes from "./inventario/infrastructure/routes/InventarioRoutes.js";
import ProductoRoutes from "./inventario/infrastructure/routes/ProductoRoutes.js";
import InsumoRoutes from "./inventario/infrastructure/routes/InsumoRoutes.js";
import ProductoRetonableRoutes from "./inventario/infrastructure/routes/ProductoRetornableRoutes.js";
import TipoInsumoRoutes from "./inventario/infrastructure/routes/TipoInsumoRoutes.js";
import ProductoImageRoutes from "./inventario/infrastructure/routes/ProductoImageRoutes.js";
/* MÓDULO VENTAS */
import ClienteRoutes from "./ventas/infrastructure/routes/ClienteRoutes.js";
import VentasRoutes from "./ventas/infrastructure/routes/VentasRoutes.js";
import PedidosRoutes from "./ventas/infrastructure/routes/PedidosRoutes.js";
import CotizacionesRoutes from "./ventas/infrastructure/routes/CotizacionRoutes.js";
import CajaRoutes from "./ventas/infrastructure/routes/CajaRoutes.js";
import MovimientoCajaRoutes from "./ventas/infrastructure/routes/MovimientoCajaRoutes.js";
import LogVentasRoutes from "./ventas/infrastructure/routes/LogVentasRoutes.js";
import EstadosVentasRoutes from "./ventas/infrastructure/routes/EstadoVentaRoutes.js";
import PagosRoutes from "./ventas/infrastructure/routes/PagosRoutes.js";
import DocumentosRoutes from "./ventas/infrastructure/routes/DocumentoRoutes.js";
/* import analisisRoutes from "./analisis/infraestructure/routes/";
import geografiaRoutes from "./geografia/infrastructure/routes/geographyRoutes.js";
import managementRoutes from "./management/infrastructure/routes/managementRoutes.js";
import proveedoresRoutes from "./proveedores/infrastructure/routes/proveedoesrRoutes.js";
 */
/* MÓDULO DE ENTREGAS */
import CamionRoutes from "./Entregas/infrastructure/routes/CamionRoutes.js";
import AgendaCargaRoutes from "./Entregas/infrastructure/routes/AgendaCargaRoutes.js";
import InventarioCamionRoutes from "./Entregas/infrastructure/routes/InvetarioCamionRoutes.js";
import EntregaRoutes from "./Entregas/infrastructure/routes/EntregaRoutes.js";
import VentaChoferRoutes from "./Entregas/infrastructure/routes/VentaChoferRoutes.js";
import AgendaViajesRoutes from "./Entregas/infrastructure/routes/AgendaViajeRoutes.js";
/* MÓDULO ANÁLISIS */
// Rutas del módulo de análisis
/* import ProductoEstadisticaRoutes from "./analisis/infrastructure/routes/ProductoEstadisticaRoutes.js";
import VentasEstadisticasRoutes from "./analisis/infrastructure/routes/VentasEstadisticasRoutes.js"; */
/* Configuración */

dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Configurar CORS
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "Authorization"], 
  },
});

// Middleware
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/* const allowedOrigins = [
  "http://localhost:3000",
  "https://jvargast.github.io/sistema-gestion-recursos-frontend",
]; */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://192.168.1.121:3000",
      "http://192.168.1.174:3000", // IP del Android/Emulador
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Métodos permitidos
    allowedHeaders: ["Content-Type", "Authorization"], // Encabezados permitidos
  })
);

/* const allowedOrigins = [
  "http://localhost:3000", // Para desarrollo local
  "https://jvargast.github.io", // Dominio base de tu frontend
];*/

/* Rutas*/
/* MÓDULO AUTH */
app.use("/api/usuarios", UsuariosRoutes);
app.use("/api/auth", AuthRoutes);
app.use("/api/empresas", EmpresaRoutes);
app.use("/api/roles", RolRoutes);
app.use("/api/permisos", PermisosRoutes);
app.use("/api/audit-logs", AuditLogsRoutes);
app.use("/api/security-settings", SecuritySettingsRoutes);
app.use("/api/sucursales", SucursalesRoutes);

/* MÓDULO INVENTARIO */
app.use("/api/estados-productos", EstadoProductoRoutes);
app.use("/api/categorias-productos", CategoriaProductoRoutes);
app.use("/api/inventarios", InventarioRoutes);
app.use("/api/productos", ProductoRoutes);
app.use("/api/insumos", InsumoRoutes);
app.use("/api/producto-retornable", ProductoRetonableRoutes);
app.use("/api/tipo-insumo", TipoInsumoRoutes);
/**
 * Para carga de fotos
 */
app.use("/api/productos/imagenes", ProductoImageRoutes);

/* MÓDULO VENTAS */
app.use("/api/clientes", ClienteRoutes);
app.use("/api/ventas", VentasRoutes);
app.use("/api/pedidos", PedidosRoutes);
app.use("/api/cotizaciones", CotizacionesRoutes);
app.use("/api/cajas", CajaRoutes);
app.use("/api/movimientos", MovimientoCajaRoutes);
app.use("/api/log-ventas", LogVentasRoutes);
app.use("/api/estados-ventas", EstadosVentasRoutes);
app.use("/api/pagos", PagosRoutes);
app.use("/api/documentos", DocumentosRoutes) 
/* app.use("/api/estado-transaccion", EstadoTransaccionRoutes);
app.use("/api/logs-transaccion", LogTransaccionRoutes);
app.use("/api/transacciones", TransaccionRoutes);
app.use("/api/detalle-transacciones", DetalleTransaccionRoutes);
app.use("/api/estado-detalle", EstadoDetallesRoutes);
app.use("/api/facturas", FacturasRoutes);
app.use("/api/estado-factura", EstadoFacturaRoutes);
app.use("/api/pagos", PagosRoutes);
app.use("/api/documentos", DocumentosRoutes) */

/* MÓDULO ANÁLISIS */
/* app.use("/api/analisis/productos", ProductoEstadisticaRoutes);
app.use("/api/analisis/ventas", VentasEstadisticasRoutes); */

/* MÓDULO DE ENTREGAS */
app.use("/api/camiones", CamionRoutes);
app.use("/api/inventario-camion", InventarioCamionRoutes);
app.use("/api/agendas", AgendaCargaRoutes);
app.use("/api/entregas", EntregaRoutes);
app.use("/api/agenda-viajes", AgendaViajesRoutes)
app.use("/api/ventas-chofer", VentaChoferRoutes);

io.on("connection", (socket) => {
  console.log("⚡ Cliente conectado:", socket.id);

  socket.on("subscribe", (id_usuario) => {
    socket.join(`usuario_${id_usuario}`);
    console.log(`✅ Usuario ${id_usuario} suscrito a notificaciones.`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Cliente desconectado:", socket.id);
  });
});

const PORT = process.env.PORT || 9000;

/* Sequelize y Servidor */
initializeDatabase()
  .then(() => {
    /* setupAnalysisCronJobs();  falta configurarlo*/
    /* console.log("Tareas [CRON] configuradas."); */
    server.listen(PORT, '0.0.0.0',() => {
      console.log(`Servidor escuchando en el puerto http://0.0.0.0:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("No se pudo iniciar la aplicación:", error);
    process.exit(1);
  });

  export { io };
