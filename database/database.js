import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import cls from "cls-hooked";
import fs from "fs";

dotenv.config();

const namespace = cls.createNamespace("app-namespace");

Sequelize.useCLS(namespace);

// Configuración para diferentes entornos
const isProduction = process.env.NODE_ENV === "production";

const caCertificatePath = isProduction
  ? "/usr/src/app/global-bundle.pem" // Ruta dentro del contenedor Docker
  : "/home/ec2-user/sistema-gestion-recursos-backend/global-bundle.pem"; // Ruta en tu servidor EC2

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: isProduction, // Deshabilitar logs en producción
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // ⚠️ IMPORTANTE para que no falle por certificado autofirmado
      },
    },
  }
);

export default sequelize;
