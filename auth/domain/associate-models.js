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
  // Relación: Un Usuario pertenece a un Rol
  Usuarios.belongsTo(Roles, {
    foreignKey: "rolId",
    as: "rol",
    onDelete: "SET NULL", // Si se elimina el rol, el campo 'rolId' se establece como NULL
    onUpdate: "CASCADE",
  });
  Roles.hasMany(Usuarios, {
    foreignKey: "rolId",
    as: "usuarios",
    onDelete: "CASCADE", // Si se elimina un rol, elimina los usuarios asociados
    onUpdate: "CASCADE",
  });

  // Relación: Un Rol tiene muchos RolesPermisos
  Roles.hasMany(RolesPermisos, {
    foreignKey: "rolId",
    as: "rolesPermisos",
    onDelete: "CASCADE", // Si se elimina un rol, elimina las asociaciones en RolesPermisos
    onUpdate: "CASCADE",
  });
  RolesPermisos.belongsTo(Roles, {
    foreignKey: "rolId",
    as: "rol",
    onDelete: "CASCADE", // Si se elimina un rol, elimina la relación
    onUpdate: "CASCADE",
  });

  // Relación: Un RolesPermisos tiene muchos Permisos
  RolesPermisos.belongsTo(Permisos, {
    foreignKey: "permisoId",
    as: "permiso",
    onDelete: "CASCADE", // Si se elimina un permiso, elimina la relación
    onUpdate: "CASCADE",
  });
  Permisos.hasMany(RolesPermisos, {
    foreignKey: "permisoId",
    as: "rolesPermisos",
    onDelete: "CASCADE", // Si se elimina un permiso, elimina las asociaciones en RolesPermisos
    onUpdate: "CASCADE",
  });

  Usuarios.belongsTo(Empresa, { foreignKey: "id_empresa" });
  Empresa.hasMany(Usuarios, { foreignKey: "id_empresa" });

  Usuarios.belongsTo(Sucursal, { foreignKey: "id_sucursal" });
  Sucursal.hasMany(Usuarios, { foreignKey: "id_sucursal" });
  AuditLogs.belongsTo(Usuarios, {
    foreignKey: "userId",
    as: "usuario",
    onDelete: "SET NULL", // Si se elimina un usuario, el log permanece con userId NULL
    onUpdate: "CASCADE",
  });

  // Opcional: Un Usuario puede tener muchos AuditLogs
  Usuarios.hasMany(AuditLogs, {
    foreignKey: "userId",
    as: "auditLogs",
    onDelete: "CASCADE", // Si se elimina un usuario, se eliminan sus logs
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
