import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Cliente from "./Cliente.js";
import EstadoTransaccion from "./EstadoTransaccion.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Factura from "../models//Factura.js";

const Transaccion = sequelize.define(
  "Transaccion",
  {
    id_transaccion: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo_transaccion: {
      type: DataTypes.STRING, // "cotizacion", "pedido", "venta"
      allowNull: false,
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    observaciones: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    monto_inicial: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    id_cliente: {
      type: DataTypes.STRING,
      references: {
        model: Cliente,
        key: "rut",
      },
    },
    id_usuario: {
      type: DataTypes.STRING,
      references: {
        model: Usuarios,
        key: "rut",
      },
    },
    asignada_a: {
      type: DataTypes.STRING,
      references: {
        model: Usuarios,
        key: "rut",
      },
      allowNull: true,
    },
    id_estado_transaccion: {
      type: DataTypes.INTEGER,
      references: {
        model: EstadoTransaccion,
        key: "id_estado_transaccion",
      },
      allowNull: false,
    },
    id_factura: {
      type: DataTypes.INTEGER,
      references: {
        model: Factura,
        key: "id_factura",
      },
      allowNull: true, // Solo algunas transacciones estarán facturadas
    },
    tipo_documento: {
      type: DataTypes.STRING,
      allowNull: true, // Puede ser null si no se emite ningún documento
      validate: {
        isIn: [["factura", "boleta"]],
      },
    },
  },
  {
    tableName: "Transaccion",
    timestamps: false,
  }
);

export default Transaccion;
