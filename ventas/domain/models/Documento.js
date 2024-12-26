import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const Documento = sequelize.define("Documento", {
    id_documento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_transaccion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Transaccion",
        key: "id_transaccion",
      },
    },
    tipo_documento: {
      type: DataTypes.STRING, // Ejemplo: "factura", "boleta", "nota_credito"
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING, // Ejemplo: "Emitido", "Anulado"
      defaultValue: "Emitido",
    },
    fecha_emision: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    detalles: {
      type: DataTypes.TEXT, // JSON o descripción adicional
      allowNull: true,
    },
  });

  export default Documento;
  