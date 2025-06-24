import { DataTypes } from "sequelize";
import Producto from "./Producto.js";
import sequelize from "../../../database/database.js";
import Insumo from "./Insumo.js";
import Venta from "../../../ventas/domain/models/Venta.js";

const ProductoRetornable = sequelize.define(
  "ProductoRetornable",
  {
    id_producto_retornable: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      references: {
        model: Producto,
        key: "id_producto",
      },
      allowNull: false,
    },
    id_insumo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Insumo,
        key: "id_insumo",
      },
    },
    id_venta: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Venta,
        key: "id_venta",
      },
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM(
        "reutilizable",
        "defectuoso",
        "pendiente_inspeccion"
      ),
      allowNull: true,
      defaultValue: "pendiente_inspeccion",
    },
    tipo_defecto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha_retorno: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "ProductoRetornable",
    timestamps: false,
  }
);

export default ProductoRetornable;
