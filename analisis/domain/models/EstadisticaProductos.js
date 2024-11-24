import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const EstadisticaProductos = sequelize.define(
  "EstadisticaProductos",
  {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ventasTotales: {

    },
    unidadesVendidas: {

    },
    año: {

    },
    datos_mensuales: {

    },
    datos_diarios: {
        
    }

  },
  {
    tableName: "EstadisticaProductos",
    timestamps: false,
  }
);

export default EstadisticaProductos;
