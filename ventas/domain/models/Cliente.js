import { DataTypes } from "sequelize";
import sequelize from "../../../database/database.js";

const Cliente = sequelize.define('Cliente', {
    rut: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
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
        defaultValue: DataTypes.NOW
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
});

export default Cliente;