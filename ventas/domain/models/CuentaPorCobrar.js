import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Venta from "./Venta.js";
import Documento from "./Documento.js";
import Sucursal from "../../../auth/domain/models/Sucursal.js";

const CuentaPorCobrar = sequelize.define(
  "CuentaPorCobrar",
  {
    id_cxc: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_venta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Venta,
        key: "id_venta",
      },
    },
    id_documento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Documento,
        key: "id_documento",
      },
    },
    id_sucursal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Sucursal, key: "id_sucursal" },
    },
    monto_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    monto_pagado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    saldo_pendiente: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fecha_emision: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_vencimiento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pendiente", // otros valores: "pagado", "vencido", "en mora"
    },
    observaciones: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "CuentaPorCobrar",
    timestamps: false,
  }
);

export default CuentaPorCobrar;
