import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../../../database/database.js";
import VentasChofer from "../../../Entregas/domain/models/VentasChofer.js";

const Documento = sequelize.define(
  "Documento",
  {
    id_documento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_transaccion: {
      type: DataTypes.INTEGER,
      allowNull: true, 
      references: {
        model: "Transaccion",
        key: "id_transaccion",
      },
    },
    id_venta_chofer: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: VentasChofer,
        key: "id_venta_chofer",
      },
    },
    id_cliente:{
      type: DataTypes.STRING,
      allowNull: true, 
      references: {
        model: "Clientes",
        key: "rut"
      }
    },
    tipo_documento: {
      type: DataTypes.STRING, // Ejemplo: "factura", "boleta", "nota_credito"
      allowNull: false,
    },
    id_estado_pago: {
      type: DataTypes.INTEGER, // Ejemplo: "Emitido", "Anulado"
      references: {
        model: "Estado_Pago",
        key: "id_estado_pago"
      }
    },
    fecha_emision: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    monto_pagado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "Documento",
    timestamps: false,
  }
);

export default Documento;
