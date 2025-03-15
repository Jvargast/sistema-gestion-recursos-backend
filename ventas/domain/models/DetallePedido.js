import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Pedido from "./Pedido.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import Insumo from "../../../inventario/domain/models/Insumo.js";


const DetallePedido = sequelize.define(
  "DetallePedido",
  {
    id_detalle_pedido: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_pedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Pedido,
        key: "id_pedido",
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
    id_insumo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Insumo,
        key: "id_insumo",
      },
    },
    tipo: {
      type: DataTypes.ENUM('producto', 'insumo'),
      allowNull: true,
    },    
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "DetallePedido",
    timestamps: false,
  }
);

export default DetallePedido;
