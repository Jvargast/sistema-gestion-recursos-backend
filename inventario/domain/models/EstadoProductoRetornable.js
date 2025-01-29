import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const EstadoProductoRetornable = sequelize.define("EstadoProductoRetornable", {
    id_estado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: "EstadoProductoRetornable",
    timestamps: false,
  });
  
  export default EstadoProductoRetornable;
  