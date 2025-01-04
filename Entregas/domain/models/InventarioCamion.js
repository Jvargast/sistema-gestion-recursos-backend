import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import Camion from "./Camion.js";
import DetalleTransaccion from "../../../ventas/domain/models/DetalleTransaccion.js";

const InventarioCamion = sequelize.define("InventarioCamion", {
  id_inventario_camion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_camion: {
    type: DataTypes.INTEGER,
    allowNull: false, // Identifica el camión
    references: {
        model: Camion,
        key: 'id_camion'
    }
  },
  id_producto: {
    type: DataTypes.INTEGER,
    allowNull: true, // Referencia al producto
    references: {
        model: Producto,
        key: 'id_producto'
    }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM(
      "En Camión - Disponible",
      "En Camión - Reservado",
      "Regresado",
      "Entregado"
    ),
    allowNull: false,
    defaultValue: "En Camión - Disponible",
  },
  id_detalle_transaccion: {
    type: DataTypes.INTEGER,
    allowNull: true, // Puede ser nulo si no está asociado a un detalle
    references: {
        model: DetalleTransaccion,
        key: "id_detalle_transaccion"
    },
  },
});

export default InventarioCamion;
