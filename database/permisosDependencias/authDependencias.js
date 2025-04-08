const authDependencias = [
  // AuditLogs
  { permiso: "auth.auditLogs.crear", dependeDe: "auth.auditLogs.ver" },
  { permiso: "auth.auditLogs.editar", dependeDe: "auth.auditLogs.ver" },
  { permiso: "auth.auditLogs.eliminar", dependeDe: "auth.auditLogs.ver" },

  // Empresa
  { permiso: "auth.empresa.crear", dependeDe: "auth.empresa.ver" },
  { permiso: "auth.empresa.editar", dependeDe: "auth.empresa.ver" },
  { permiso: "auth.empresa.eliminar", dependeDe: "auth.empresa.ver" },

  // Permisos
  { permiso: "auth.permisos.crear", dependeDe: "auth.permisos.ver" },
  { permiso: "auth.permisos.editar", dependeDe: "auth.permisos.ver" },
  { permiso: "auth.permisos.eliminar", dependeDe: "auth.permisos.ver" },

  // Roles
  { permiso: "auth.roles.crear", dependeDe: "auth.roles.ver" },
  { permiso: "auth.roles.editar", dependeDe: "auth.roles.ver" },
  { permiso: "auth.roles.eliminar", dependeDe: "auth.roles.ver" },

  // SecuritySettings
  {
    permiso: "auth.securitysettings.crear",
    dependeDe: "auth.securitysettings.ver",
  },
  {
    permiso: "auth.securitysettings.editar",
    dependeDe: "auth.securitysettings.ver",
  },
  {
    permiso: "auth.securitysettings.eliminar",
    dependeDe: "auth.securitysettings.ver",
  },

  // Sucursal
  { permiso: "auth.sucursal.crear", dependeDe: "auth.sucursal.ver" },
  { permiso: "auth.sucursal.editar", dependeDe: "auth.sucursal.ver" },
  { permiso: "auth.sucursal.eliminar", dependeDe: "auth.sucursal.ver" },

  // Usuarios
  { permiso: "auth.usuarios.crear", dependeDe: "auth.usuarios.ver" },
  { permiso: "auth.usuarios.editar", dependeDe: "auth.usuarios.ver" },
  { permiso: "auth.usuarios.eliminar", dependeDe: "auth.usuarios.ver" },
];

export default authDependencias;
