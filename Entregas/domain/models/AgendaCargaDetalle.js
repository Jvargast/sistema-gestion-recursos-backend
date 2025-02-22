import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import AgendaCarga from "./AgendaCarga.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import Insumo from "../../../inventario/domain/models/Insumo.js";

const AgendaCargaDetalle = sequelize.define(
  "AgendaCargaDetalle",
  {
    id_agenda_carga_detalle: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_agenda_carga: {
      type: DataTypes.INTEGER,
      references: {
        model: AgendaCarga,
        key: "id_agenda_carga",
      },
      allowNull: false,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      references: {
        model: Producto,
        key: "id_producto",
      },
      allowNull: true,
    },
    id_insumo: {
      type: DataTypes.INTEGER,
      references: {
        model: Insumo,
        key: "id_insumo",
      },
      allowNull: true,
    },
    unidad_medida: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    peso_estimado: {
      type: DataTypes.FLOAT,
      allowNull: true, 
    },
    estado: {
      type: DataTypes.ENUM("Pendiente", "Cargado", "Rechazado", "Descargado"),
      allowNull: false,
      defaultValue: "Pendiente",
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "AgendaCargaDetalle",
    timestamps: false,
  }
);

export default AgendaCargaDetalle;
