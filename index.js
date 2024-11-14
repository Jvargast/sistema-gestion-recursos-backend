import express from 'express';
import bodyParser from 'body-parser';
// Mongodb
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
// Rutas para prueba con mongo
import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/client.js";
/* import generalRoutes from "./Routes/general.js"; */
import managementRoutes from "./routes/management.js";
import salesRoutes from "./routes/sales.js";

// Rutas para arquitectura hexagonal
/* import authRoutes from "./auth/infraestructure/routes/authRoutes.js";
import analisisRoutes from "./analisis/infraestructure/routes/";
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
app.use(cors());

/* Rutas*/
/* app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/general", generalRoutes);
app.use("/api/management", managementRoutes);
app.use("/api/sales", salesRoutes);
 */
/* Mongoose Setup */
/* const PORT = process.env.PORT || 9000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`)); */

/* Sequelize y Servidor */

