import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";


const Pago = sequelize.define(
  "Pago",
  {
    id_pago: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_documento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Documento",
        key: "id_documento",
      },
    },
    tipo_documento: {
      type: DataTypes.ENUM("factura", "boleta"),
      allowNull: false,
    },
    id_metodo_pago: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Metodo_Pago",
        key: "id_metodo_pago",
      },
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2), // Almacenar el monto del pago específico
      allowNull: true,
      defaultValue: 0,
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    referencia: {
      type: DataTypes.STRING, // Código de referencia de transferencia o tarjeta
      allowNull: true,
    },
  },
  {
    tableName: "Pago",
    timestamps: false,
  }
);

export default Pago;
