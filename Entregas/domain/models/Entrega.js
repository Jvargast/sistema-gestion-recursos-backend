import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Cliente from "../../../ventas/domain/models/Cliente.js";
import AgendaViajes from "./AgendaViaje.js";
import Camion from "./Camion.js";
import Documento from "../../../ventas/domain/models/Documento.js";

const Entrega = sequelize.define(
  "Entrega",
  {
    id_entrega: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_agenda_viaje: {
      type: DataTypes.INTEGER,
      references: {
        model: AgendaViajes,
        key: "id_agenda_viaje",
      },
    },
    id_camion: {
      type: DataTypes.INTEGER,
      references: {
        model: Camion,
        key: "id_camion",
      },
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      references: {
        model: Cliente,
        key: "id_cliente",
      },
      allowNull: true,
    },
    productos_entregados: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    insumo_entregados: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    botellones_retorno: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    es_entrega_directa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    monto_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    estado_entrega: {
      type: DataTypes.ENUM("pendiente", "en_proceso", "completada", "fallida", "anulada"),
    },
    fecha_hora: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    id_documento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Documento,
        key: "id_documento",
      },
    },
    motivo_fallo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Entrega",
    timestamps: false,
  }
);

export default Entrega;
