import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Producto from "../../../inventario/domain/models/Producto.js";
import Camion from "./Camion.js";

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
      "Regresado"
    ),
    allowNull: false,
    defaultValue: "En Camión - Disponible",
  },
});

export default InventarioCamion;
