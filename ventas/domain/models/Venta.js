import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Cliente from "./Cliente.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Caja from "./Caja.js";
import Sucursal from "../../../auth/domain/models/Sucursal.js";
import MetodoPago from "./MetodoPago.js";
import EstadoVenta from "./EstadoVenta.js";

const Venta = sequelize.define(
  "Venta",
  {
    id_venta: {
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
        key: "rut",
      },
    },
    id_caja: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Caja,
        key: "id_caja",
      },
    },
    id_sucursal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Sucursal,
        key: "id_sucursal",
      },
    },
    tipo_entrega: {
      type: DataTypes.ENUM("retiro_en_sucursal", "despacho_a_domicilio", "pedido_pagado_anticipado"),
      allowNull: false,
    },
    direccion_entrega: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    impuestos_totales: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    }, 
    fecha_entrega: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    id_estado_venta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: EstadoVenta,
        key: "id_estado_venta",
      },
    },
    descuento_total: {
      type: DataTypes.DECIMAL(10, 2), // Descuento aplicado al total de la venta
      allowNull: true,
      defaultValue: 0,
    },
    id_metodo_pago: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MetodoPago,
        key: "id_metodo_pago",
      },
    },
    notas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Venta",
    timestamps: false,
  }
);

export default Venta;
