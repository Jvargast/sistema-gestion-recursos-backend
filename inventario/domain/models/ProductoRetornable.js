import { DataTypes } from "sequelize";
import Producto from "./Producto.js";
import sequelize from "../../../database/database.js";
import Entrega from "../../../Entregas/domain/models/Entrega.js";
import Venta from "../../../ventas/domain/models/Venta.js";
import Camion from "../../../Entregas/domain/models/Camion.js";
import Insumo from "./Insumo.js";

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
    id_entrega: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Entrega,
        key: "id_entrega",
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
    id_camion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Camion,
        key: "id_camion",
      },
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("reutilizable", "defectuoso", "pendiente_inspeccion"),
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
