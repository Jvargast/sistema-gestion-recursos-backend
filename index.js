import express from 'express';
import bodyParser from 'body-parser';
import initializeDatabase from './database/db-init.js';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
// Rutas para arquitectura hexagonal
/* MÓDULO AUTH */
import AuthRoutes from './auth/infraestructure/routes/AuthRoutes.js';
import UsuariosRoutes from './auth/infraestructure/routes/UsuariosRoutes.js';
import RolRoutes from './auth/infraestructure/routes/RolRoutes.js';
import PermisosRoutes from './auth/infraestructure/routes/PermisosRoutes.js';
/* MÓDULO INVENTARIO */
import EstadoProductoRoutes from './inventario/infrastructure/routes/EstadoProductoRoutes.js';
import CategoriaProductoRoutes from './inventario/infrastructure/routes/CategoriaProductoRoutes.js';
import InventarioRoutes from './inventario/infrastructure/routes/InventarioRoutes.js';
import ProductoRoutes from './inventario/infrastructure/routes/ProductoRoutes.js';
import TipoProductoRoutes from './inventario/infrastructure/routes/TipoProductoRoutes.js';
/* import analisisRoutes from "./analisis/infraestructure/routes/";
import geografiaRoutes from "./geografia/infrastructure/routes/geographyRoutes.js";
import inventarioRoutes from "./inventario/infrastructure/routes/InventariosRoutes.js";
import managementRoutes from "./management/infrastructure/routes/managementRoutes.js";
import proveedoresRoutes from "./proveedores/infrastructure/routes/proveedoesrRoutes.js";
import ventasRoutes from "./ventas/infrastructure/routes/ventasRoutes.js"; */


/* Configuración */

dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(cors());
/* app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));  */

/* Rutas*/
/* MÓDULO AUTH */
app.use('/api/usuarios', UsuariosRoutes);
app.use('/api/auth', AuthRoutes);
app.use('/api/roles', RolRoutes);
app.use('/api/permisos', PermisosRoutes);

/* MÓDULO INVENTARIO */
app.use('/api/estados-productos', EstadoProductoRoutes);
app.use('/api/categorias-productos', CategoriaProductoRoutes);
app.use('/api/inventarios', InventarioRoutes);
app.use('/api/productos', ProductoRoutes);
app.use('/api/tipo-productos', TipoProductoRoutes);

/* app.use("/api/client", clientRoutes);
app.use("/api/general", generalRoutes);
app.use("/api/management", managementRoutes);
app.use("/api/sales", salesRoutes); */

const PORT = process.env.PORT || 9000;

/* Sequelize y Servidor */
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo iniciar la aplicación:', error);
    process.exit(1);
  });

