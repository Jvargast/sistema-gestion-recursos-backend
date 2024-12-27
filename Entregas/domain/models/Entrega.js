import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const Entrega = sequelize.define("Entrega", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fechaHoraEntrega: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  estadoEntrega: {
    type: DataTypes.ENUM("Pendiente", "Entregado"),
    defaultValue: "Pendiente",
  },
  id_detalle_transaccion: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_usuario_chofer: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});


export default Entrega;
