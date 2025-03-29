import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import cls from "cls-hooked";
import fs from "fs";

//Variables de entorno
const env = process.env.NODE_ENV || "development";
const envPath = `.env.${env === "production" ? "prod" : "local"}`;

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config(); 
}

const namespace = cls.createNamespace("app-namespace");
Sequelize.useCLS(namespace);

const isProduction = env === "production";

const sequelizeConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "postgres",
  logging: !!isProduction, 
};

if (isProduction) {
  sequelizeConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false, 
    },
  };
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  sequelizeConfig
);

export default sequelize;
