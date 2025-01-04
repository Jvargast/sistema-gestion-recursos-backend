import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";


const Factura = sequelize.define("Factura", {
  id_factura: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_documento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Documento",
      key: "id_documento",
    },
  },
  numero_factura: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tipo_factura: {
    type: DataTypes.ENUM("A", "B", "C"),
    allowNull: true,
    defaultValue: "A",
  },
  precios_opcion: {
    type: DataTypes.STRING, // Ejemplo: 'Neto', 'Bruto'
    allowNull: true,
  },
  forma_pago: {
    type: DataTypes.ENUM("Contado", "90 días", "60 días", "30 días"),
    allowNull: false,
    defaultValue: "Contado",
  },
},
{
  tableName: "Factura",
  timestamps: false
});

export default Factura;
