import express from "express";
import bodyParser from "body-parser";
import initializeDatabase from "./database/db-init.js";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";

/**
 * Implementación de tareas
 */
import setupAnalysisCronJobs from "./analisis/infrastructure/cron/analysisCronJobs.js";
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
import TipoProductoRoutes from "./inventario/infrastructure/routes/TipoProductoRoutes.js";
import ProductoImageRoutes from "./inventario/infrastructure/routes/ProductoImageRoutes.js"
/* MÓDULO VENTAS */
import ClienteRoutes from "./ventas/infrastructure/routes/ClienteRoutes.js";
import EstadoTransaccionRoutes from "./ventas/infrastructure/routes/EstadoTransaccionRoutes.js";
import DetalleTransaccionRoutes from "./ventas/infrastructure/routes/DetalleTransaccionroutes.js";
import EstadoDetallesRoutes from "./ventas/infrastructure/routes/EstadoDetallesRoutes.js";
import LogTransaccionRoutes from "./ventas/infrastructure/routes/LogTransaccionesRoutes.js";
import TransaccionRoutes from "./ventas/infrastructure/routes/TransaccionRoutes.js";
import FacturasRoutes from "./ventas/infrastructure/routes/FacturasRoutes.js";
import EstadoFacturaRoutes from "./ventas/infrastructure/routes/EstadoFacturaRoutes.js";
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
/* MÓDULO ANÁLISIS */
// Rutas del módulo de análisis
import ProductoEstadisticaRoutes from "./analisis/infrastructure/routes/ProductoEstadisticaRoutes.js";
import VentasEstadisticasRoutes from "./analisis/infrastructure/routes/VentasEstadisticasRoutes.js";
/* Configuración */

dotenv.config();
const app = express();
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
    origin: process.env.ALLOWED_ORIGINS.split(","), // Asegúrate de que esté configurado
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Métodos permitidos
    allowedHeaders: ["Content-Type", "Authorization"], // Encabezados permitidos
  })
);

/* const allowedOrigins = [
  "http://localhost:3000", // Para desarrollo local
  "https://jvargast.github.io", // Dominio base de tu frontend
];


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
app.use("/api/tipo-productos", TipoProductoRoutes);
/**
 * Para carga de fotos
 */
app.use("/api/productos/imagenes", ProductoImageRoutes);


/* MÓDULO VENTAS */
app.use("/api/clientes", ClienteRoutes);
app.use("/api/estado-transaccion", EstadoTransaccionRoutes);
app.use("/api/logs-transaccion", LogTransaccionRoutes);
app.use("/api/transacciones", TransaccionRoutes);
app.use("/api/detalle-transacciones", DetalleTransaccionRoutes);
app.use("/api/estado-detalle", EstadoDetallesRoutes);
app.use("/api/facturas", FacturasRoutes);
app.use("/api/estado-factura", EstadoFacturaRoutes);
app.use("/api/pagos", PagosRoutes);
app.use("/api/documentos", DocumentosRoutes)

/* MÓDULO ANÁLISIS */
app.use("/api/analisis/productos", ProductoEstadisticaRoutes);
app.use("/api/analisis/ventas", VentasEstadisticasRoutes);

/* MÓDULO DE ENTREGAS */
app.use("/api/camiones", CamionRoutes);
app.use("/api/inventario-camion", InventarioCamionRoutes);
app.use("/api/agendas", AgendaCargaRoutes);
app.use("/api/entregas", EntregaRoutes);
app.use("/api/ventas-chofer", VentaChoferRoutes);


const PORT = process.env.PORT || 9000;

/* Sequelize y Servidor */
initializeDatabase()
  .then(() => {
    /* setupAnalysisCronJobs();  falta configurarlo*/
    /* console.log("Tareas [CRON] configuradas."); */
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto [${PORT}]`);
    });
  })
  .catch((error) => {
    console.error("No se pudo iniciar la aplicación:", error);
    process.exit(1);
  });
