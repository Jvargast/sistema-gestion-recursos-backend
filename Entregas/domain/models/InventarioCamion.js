import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import Camion from "./Camion.js";
import Insumo from "../../../inventario/domain/models/Insumo.js";

const InventarioCamion = sequelize.define(
  "InventarioCamion",
  {
    id_inventario_camion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_camion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Camion,
        key: "id_camion",
      },
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Producto,
        key: "id_producto",
      },
    },
    id_insumo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Insumo,
        key: "id_insumo",
      },
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM(
        "En Camión - Disponible",
        "En Camión - Reservado",
        "En Camión - Retorno",
        "En Camión - Reservado - Entrega",
        "Regresado",
        "Entregado"
      ),
      allowNull: false,
      defaultValue: "En Camión - Disponible",
    },
    tipo: {
      type: DataTypes.ENUM("Disponible", "Reservado", "Retorno"),
      allowNull: false,
      defaultValue: "Disponible",
    },
    es_retornable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "InventarioCamion",
    timestamps: false,
  }
);

export default InventarioCamion;
