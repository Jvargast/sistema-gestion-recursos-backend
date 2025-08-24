import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import FormulaProducto from "../../../inventario/domain/models/FormulaProducto.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";
import Sucursal from "../../../auth/domain/models/Sucursal.js";

const Produccion = sequelize.define(
  "Produccion",
  {
    id_produccion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    id_formula: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: FormulaProducto,
        key: "id_formula",
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

    rut_usuario: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "rut",
      },
    },
    cantidad_lote: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Veces que se replica la fórmula (lote)",
    },

    unidades_fabricadas: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: false,
      comment: "Cantidad real del producto final ingresada a inventario",
    },

    fecha_produccion: {
      type: DataTypes.DATE,
    },

    observacion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "Produccion",
    timestamps: false,
  }
);

export default Produccion;
