import { DataTypes } from "sequelize";
import Camion from "./Camion.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import Entrega from "./Entrega.js";
import sequelize from "../../../database/database.js";


const ProductoRetornableCamion = sequelize.define(
  "ProductoRetornableCamion",
  {
    id_producto_retornable_camion: {
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
      allowNull: false,
      references: {
        model: Producto,
        key: "id_producto",
      },
    },
    id_entrega: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Entrega,
        key: "id_entrega",
      },
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("pendiente_inspeccion", "defectuoso"),
      allowNull: false,
      defaultValue: "pendiente_inspeccion",
    },
    tipo_defecto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha_registro: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "ProductoRetornableCamion",
    timestamps: false,
  }
);

export default ProductoRetornableCamion;
