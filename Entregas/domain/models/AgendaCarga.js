/**
 * 
 * 
 * Propuesta de solución:
Crear una tabla ajena a la transacción que registre los productos cargados en el camión.
Esta tabla podría llamarse AgendaCarga y manejar los siguientes campos:
id_carga: ID único de la carga.
id_producto: Producto cargado.
cantidad: Cantidad de producto cargado.
estado_producto: Estado del producto (por ejemplo, "Disponible en camión", "Reservado para venta rápida").
id_camion: Identificador del camión donde se carga el producto.
fecha_carga: Fecha y hora en que se realizó la carga.
 * 
 * 
 * 
 */
import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";

const AgendaCarga = sequelize.define("AgendaCarga", {
  id_agenda_carga: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fechaHora: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  id_usuario_chofer: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Usuarios,
      key: 'rut',
    }
  },
  notas: {
    type: DataTypes.STRING,
    allowNull: true, // Para información adicional si es necesaria
  },
});


export default AgendaCarga;
