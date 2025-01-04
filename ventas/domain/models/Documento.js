import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

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
      allowNull: false,
      references: {
        model: "Transaccion",
        key: "id_transaccion",
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
    referencia_pago: {
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
