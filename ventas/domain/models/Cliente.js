import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";
import Usuarios from "../../../auth/domain/models/Usuarios.js";

const Cliente = sequelize.define('Cliente', {
    id_cliente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    rut: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    tipo_cliente: {
        type: DataTypes.ENUM('persona', 'empresa'),
        allowNull: false,
    },
    razon_social: {
        type: DataTypes.STRING,
        allowNull: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: true
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: true
    },
    direccion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull:false,
    },
    email:  {
        type: DataTypes.STRING,
        allowNull: true
    },
    fecha_registro: {
        type: DataTypes.DATE,
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    creado_por: {
        type: DataTypes.STRING,
        allowNull:true,
        references: {
            model: Usuarios,
            key: "rut"
        }
    }
});

export default Cliente;