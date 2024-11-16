import Usuarios from './models/Usuarios.js';
import Roles from './models/Roles.js';
import RolesPermisos from './models/RolesPermisos.js';
import Permisos from './models/Permisos.js';

function loadAuthAssociations() {
  // Relación: Un Usuario pertenece a un Rol
  Usuarios.belongsTo(Roles, { foreignKey: 'rolId', as: 'rol' });
  Roles.hasMany(Usuarios, { foreignKey: 'rolId', as: 'usuarios' });

  // Relación: Un Rol tiene muchos RolesPermisos
  Roles.hasMany(RolesPermisos, { foreignKey: 'rolId', as: 'rolesPermisos' });
  RolesPermisos.belongsTo(Roles, { foreignKey: 'rolId', as: 'rol' });

  // Relación: Un RolesPermisos tiene muchos Permisos
  RolesPermisos.belongsTo(Permisos, { foreignKey: 'permisoId', as: 'permiso' });
  Permisos.hasMany(RolesPermisos, { foreignKey: 'permisoId', as: 'rolesPermisos' });

  console.log('Asociaciones del módulo de autenticación cargadas');
}

export default loadAuthAssociations;