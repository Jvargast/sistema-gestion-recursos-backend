import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Cliente from "../../../ventas/domain/models/Cliente.js";
import MetodoPago from "../../../ventas/domain/models/MetodoPago.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Camion from "./Camion.js";


const VentasChofer = sequelize.define(
  "VentasChofer",
  {
    id_venta_chofer: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_camion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Camion,
        key: "id_camion",
      },
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    id_metodo_pago: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MetodoPago,
        key: "id_metodo_pago",
      },
    },
    total_venta: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0, // Inicializa el total en 0
    },
    tipo_venta: {
      type: DataTypes.ENUM("productos", "insumos", "mixto"),
      allowNull: false,
      defaultValue: "productos",
    },
    
    estadoPago: {
      type: DataTypes.ENUM("pendiente", "pagado", "rechazado"),
      allowNull: false,
      defaultValue: "pendiente", // Por defecto, el pago está pendiente
    },
    fechaHoraVenta: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "VentasChofer",
    timestamps: false,
  }
);

export default VentasChofer;
