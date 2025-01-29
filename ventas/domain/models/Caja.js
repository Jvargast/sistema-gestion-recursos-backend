import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Sucursal from "../../../auth/domain/models/Sucursal.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";

const Caja = sequelize.define(
  "Caja",
  {
    id_caja: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_sucursal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Sucursal,
        key: "id_sucursal",
      },
    },
    fecha_apertura: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_cierre: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    saldo_inicial: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    saldo_final: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("abierta", "cerrada"),
      defaultValue: "cerrada"
    },
    usuario_asignado: {
      type: DataTypes.STRING,
      allowNull: true, // Obligatorio saber quién abrió la caja.
      references: {
        model: Usuarios, // Asumiendo que existe un modelo de usuarios.
        key: "rut",
      },
    },
    usuario_apertura: {
      type: DataTypes.STRING,
      allowNull: true, // Obligatorio saber quién abrió la caja.
      references: {
        model: Usuarios, // Asumiendo que existe un modelo de usuarios.
        key: "rut",
      },
    },
    usuario_cierre: {
      type: DataTypes.STRING,
      allowNull: true, // Puede ser nulo si aún no se cierra.
      references: {
        model: Usuarios,
        key: "rut",
      },
    },
  },
  {
    tableName: "Caja",
    timestamps: false,
  }
);

export default Caja;
