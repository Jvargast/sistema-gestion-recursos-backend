import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import EstadoProducto from "./EstadoProducto.js";
import CategoriaProducto from "./CategoriaProducto.js";


const Producto = sequelize.define(
  "Producto",
  {
    id_producto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_producto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    marca: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    codigo_barra: {
      type: DataTypes.STRING,
      unique: true, 
      allowNull: true, 
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_de_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    id_categoria: {
      type: DataTypes.INTEGER,
      references: {
        model: CategoriaProducto,
        key: "id_categoria",
      },
    },
    id_estado_producto: {
      type: DataTypes.INTEGER,
      references: {
        model: EstadoProducto,
        key: "id_estado_producto",
      },
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    es_para_venta: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, 
    },
  },
  {
    tableName: "Producto",
    timestamps: false,
  }
);

export default Producto;
