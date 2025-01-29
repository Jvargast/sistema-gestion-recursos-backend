import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";
import EstadoPago from "./EstadoPago.js";

const Documento = sequelize.define(
  "Documento",
  {
    id_documento: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_venta: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_usuario_creador: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "rut",
      },
    },
    tipo_documento: {
      type: DataTypes.ENUM("boleta", "factura"),
      allowNull: false,
    },
    numero: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fecha_emision: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_estado_pago: {
      type: DataTypes.INTEGER,
      references: {
        model: EstadoPago,
        key: "id_estado_pago",
      },
      allowNull: false,
    },
    monto_neto: {
      type: DataTypes.DECIMAL(10, 2), // Valor antes de aplicar impuestos
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    iva: {
      type: DataTypes.DECIMAL(10, 2), // Impuesto calculado sobre el neto
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("emitido", "anulado"),
      allowNull: false,
    },
    observaciones: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Documento",
    timestamps: false,
  }
);

export default Documento;
