import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Cliente from "./Cliente.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";

const Cotizacion = sequelize.define(
  "Cotizacion",
  {
    id_cotizacion: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Cliente,
        key: "id_cliente",
      },
    },
    id_vendedor: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "rut"
      }
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_vencimiento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    impuesto: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true, 
      defaultValue: 0.19, 
    },
    impuestos_totales: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },        
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    descuento_total: {
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: true,
      defaultValue: 0,
    },
    estado: {
      type: DataTypes.ENUM("activa", "convertida", "vencida"),
      allowNull: false,
    },
    notas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Cotizacion",
    timestamps: false,
  }
);

export default Cotizacion;
