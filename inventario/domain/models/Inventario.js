import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Producto from "./Producto.js";
import Insumo from "./Insumo.js";
import Sucursal from "../../../auth/domain/models/Sucursal.js";

const Inventario = sequelize.define(
  "Inventario",
  {
    id_inventario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Producto,
        key: "id_producto",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    id_insumo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Insumo,
        key: "id_insumo",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    id_sucursal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Sucursal,
        key: "id_sucursal",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "Inventario",
    timestamps: false,
  }
);

export default Inventario;
