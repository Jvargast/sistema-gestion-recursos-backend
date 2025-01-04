import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Producto from "../../../inventario/domain/models/Producto.js";

const ProductoEstadisticas = sequelize.define(
  "ProductoEstadisticas",
  {
    id_producto_estadisticas: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      references: {
        model: Producto,
        key: "id_producto",
      },
      allowNull: false, // Cambiado a false para asegurar la asociación
      onDelete: "CASCADE", // Borra estadísticas si el producto asociado se elimina
      onUpdate: "CASCADE",
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ventas_anuales: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    unidades_vendidas_anuales: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    datos_mensuales: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    datos_diarios: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    tableName: "ProductoEstadisticas",
    timestamps: false,
    indexes: [
      { fields: ["year", "id_producto"] }, // Índice para búsquedas rápidas por año
    ],
  }
);

export default ProductoEstadisticas;
