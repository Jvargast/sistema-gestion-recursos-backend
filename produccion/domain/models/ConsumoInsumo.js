import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Produccion from "./Produccion.js";
import Insumo from "../../../inventario/domain/models/Insumo.js";

const ConsumoInsumo = sequelize.define(
  "ConsumoInsumo",
  {
    id_consumo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    id_produccion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Produccion,
        key: "id_produccion",
      },
      onDelete: "CASCADE",
    },

    id_insumo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Insumo,
        key: "id_insumo",
      },
    },

    cantidad_consumida: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: false,
    },

    unidad_medida: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "u.",
    },
  },
  {
    tableName: "ConsumoInsumo",
    timestamps: false,
  }
);

export default ConsumoInsumo;
