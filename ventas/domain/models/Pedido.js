import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Cliente from "./Cliente.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";
import EstadoVenta from "./EstadoVenta.js";
import MetodoPago from "./MetodoPago.js";


const Pedido = sequelize.define(
  "Pedido",
  {
    id_pedido: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Cliente,
        key: "id_cliente",
      },
    },
    id_chofer: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Usuarios,
        key: "rut",
      },
    },
    fecha_pedido: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    id_estado_pedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: EstadoVenta, 
        key: "id_estado_venta",
      },
    },
    id_metodo_pago: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MetodoPago,
        key: "id_metodo_pago",
      },
    },
    direccion_entrega: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "Pedido",
    timestamps: false,
  }
);

export default Pedido;
