import { DataTypes } from "sequelize";
import Cliente from "../../../ventas/domain/models/Cliente.js";
import Producto from "./Producto.js";
import sequelize from "../../../database/database.js";
import Entrega from "../../../Entregas/domain/models/Entrega.js";

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
    id_entrega: {
      type: DataTypes.INTEGER,
      allowNull: false, 
      references: {
        model: Entrega,
        key: "id_entrega",
      },
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("reutilizable", "defectuoso"),
      allowNull: true,
    },
    tipo_defecto: {
      type: DataTypes.STRING,
      allowNull: true, // Solo si el estado es "defectuoso".
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
