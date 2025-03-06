import { DataTypes } from "sequelize";
import sequelize from "../../database/database.js";
import Usuarios from "../../auth/domain/models/Usuarios.js";


const Notificacion = sequelize.define(
  "Notificacion",
  {
    id_notificacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "rut",
      },
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM("pedido_asignado", "entrega_realizada", "alerta"),
      allowNull: false,
    },
    leida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Notificacion",
    timestamps: false,
  }
);

export default Notificacion;
