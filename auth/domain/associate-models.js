import Usuarios from "./models/Usuarios.js";
import Roles from "./models/Roles.js";
import RolesPermisos from "./models/RolesPermisos.js";
import Permisos from "./models/Permisos.js";
import Empresa from "./models/Empresa.js";
import Sucursal from "./models/Sucursal.js";
import AuditLogs from "./models/AuditLogs.js";
import PermisosDependencias from "./models/PermisosDependencias.js";
import UbicacionChofer from "./models/UbicacionChofer.js";
import UserPreferences from "./models/UserPreferences.js";
import Caja from "../../ventas/domain/models/Caja.js";

function loadAuthAssociations() {

  Usuarios.belongsTo(Roles, {
    foreignKey: "rolId",
    as: "rol",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  Roles.hasMany(Usuarios, {
    foreignKey: "rolId",
    as: "usuarios",
    onDelete: "CASCADE", 
    onUpdate: "CASCADE",
  });


  Roles.hasMany(RolesPermisos, {
    foreignKey: "rolId",
    as: "rolesPermisos",
    onDelete: "CASCADE", 
    onUpdate: "CASCADE",
  });
  RolesPermisos.belongsTo(Roles, {
    foreignKey: "rolId",
    as: "rol",
    onDelete: "CASCADE", 
    onUpdate: "CASCADE",
  });

 
  RolesPermisos.belongsTo(Permisos, {
    foreignKey: "permisoId",
    as: "permiso",
    onDelete: "CASCADE", 
    onUpdate: "CASCADE",
  });
  Permisos.hasMany(RolesPermisos, {
    foreignKey: "permisoId",
    as: "rolesPermisos",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Usuarios.belongsTo(Empresa, {
    foreignKey: "id_empresa",
    as: "Empresa",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  Empresa.hasMany(Usuarios, {
    foreignKey: "id_empresa",
    as: "usuarios",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Usuarios.belongsTo(Sucursal, {
    foreignKey: "id_sucursal",
    as: "Sucursal",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  Sucursal.hasMany(Usuarios, {
    foreignKey: "id_sucursal",
    as: "usuarios",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Sucursal.belongsTo(Empresa, {
    foreignKey: "id_empresa",
    as: "empresa",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Empresa.hasMany(Sucursal, {
    foreignKey: "id_empresa",
    as: "sucursales",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  AuditLogs.belongsTo(Usuarios, {
    foreignKey: "userId",
    as: "usuario",
    onDelete: "SET NULL", 
    onUpdate: "CASCADE",
  });

  
  Usuarios.hasMany(AuditLogs, {
    foreignKey: "userId",
    as: "auditLogs",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Permisos.belongsToMany(Permisos, {
    as: "Dependencias",
    through: PermisosDependencias,
    foreignKey: "permisoId",
    otherKey: "dependeDeId",
  });
  Permisos.belongsToMany(Permisos, {
    as: "RequierenEste",
    through: PermisosDependencias,
    foreignKey: "dependeDeId",
    otherKey: "permisoId",
  });

  Usuarios.hasMany(UbicacionChofer, {
    foreignKey: "rut",
    sourceKey: "rut",
    as: "ubicaciones",
  });

  UbicacionChofer.belongsTo(Usuarios, {
    foreignKey: "rut",
    targetKey: "rut",
    as: "chofer",
  });

  UserPreferences.belongsTo(Usuarios, {
    foreignKey: "user_rut",
    targetKey: "rut",
    as: "user",
    onDelete: "CASCADE",
  });
  UserPreferences.belongsTo(Usuarios, {
    foreignKey: "preferred_vendor_rut",
    targetKey: "rut",
    as: "preferredVendor",
    onDelete: "SET NULL",
  });
  UserPreferences.belongsTo(Sucursal, {
    foreignKey: "preferred_branch_id",
    targetKey: "id_sucursal",
    as: "preferredBranch",
    onDelete: "SET NULL",
  });
  UserPreferences.belongsTo(Caja, {
    foreignKey: "preferred_cashbox_id",
    targetKey: "id_caja",
    as: "preferredCashbox",
    onDelete: "SET NULL",
  });

  console.log("Asociaciones del módulo de autenticación cargadas");
}

export default loadAuthAssociations;
