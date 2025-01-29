import { DataTypes } from "sequelize";
import Usuarios from "../../../auth/domain/models/Usuarios.js";
import sequelize from "../../../database/database.js";
import Cliente from "../../../ventas/domain/models/Cliente.js";
import AgendaViajes from "./AgendaViaje.js";

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
      allowNull: true, // Puede ser nulo si no se asigna cliente directamente.
      references: {
        model: Cliente,
        key: "id_cliente",
      },
    },
    id_chofer: {
      type: DataTypes.STRING,
      allowNull: true, // Nulo si aún no se asigna chofer.
      references: {
        model: Usuarios,
        key: "rut",
      },
    },
    id_agenda_viaje: {
      type: DataTypes.INTEGER,
      allowNull: true, // Puede estar relacionado con una agenda de viaje.
      references: {
        model: AgendaViajes,
        key: "id_agenda_viaje",
      },
    },
    productos_pedidos: {
      type: DataTypes.JSON, // Detalle de productos solicitados (id_producto, cantidad, precio, etc.).
      allowNull: false,
    },
    estado_pedido: {
      type: DataTypes.ENUM(
        "pendiente",
        "asignado",
        "procesado",
        "entregado",
        "cancelado"
      ),
      allowNull: false,
      defaultValue: "pendiente",
    },
    origen_pedido: {
      type: DataTypes.ENUM("sucursal", "chofer"),
      allowNull: false,
      defaultValue: "sucursal", // Define si fue creado por la sucursal o en ruta.
    },
    prioridad: {
      type: DataTypes.ENUM("baja", "media", "alta"),
      allowNull: false,
      defaultValue: "media",
    },
    tipo_entrega: {
      type: DataTypes.ENUM("retiro_sucursal", "domicilio"),
      allowNull: false,
      defaultValue: "domicilio",
    },
    monto_total: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    fecha_pedido: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Pedido",
    timestamps: false,
  }
);

export default Pedido;
