import sequelize from './database.js';
import Usuarios from '../auth/domain/models/Usuarios.js';
import Roles from '../auth/domain/models/Roles.js';
import Permisos from '../auth/domain/models/Permisos.js';
import RolesPermisos from '../auth/domain/models/RolesPermisos.js';

async function populateDatabase() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('Conexión establecida con éxito.');

    // Sincronizar modelos (solo en desarrollo)
    await sequelize.sync({ alter: true });

    console.log('Poblando la base de datos...');

    // Crear permisos
    const permisosAuth = [
      { nombre: 'iniciar_sesion', descripcion: 'Permiso para iniciar sesión' },
      { nombre: 'ver_permisos', descripcion: 'Permiso para ver permisos' },
      { nombre: 'crear_permisos', descripcion: 'Permiso para crear permisos' },
      { nombre: 'eliminar_permisos', descripcion: 'Permiso para eliminar permisos' },
      { nombre: 'ver_roles', descripcion: 'Permiso para ver roles' },
      { nombre: 'crear_roles', descripcion: 'Permiso para crear roles' },
      { nombre: 'editar_roles', descripcion: 'Permiso para editar roles' },
      { nombre: 'eliminar_roles', descripcion: 'Permiso para eliminar roles' },
      { nombre: 'ver_usuarios', descripcion: 'Permiso para ver usuarios' },
      { nombre: 'crear_usuarios', descripcion: 'Permiso para crear usuarios' },
      { nombre: 'editar_usuarios', descripcion: 'Permiso para editar usuarios' },
      { nombre: 'eliminar_usuarios', descripcion: 'Permiso para eliminar usuarios' },
    ];

    const permisosCreados = await Permisos.bulkCreate(permisosAuth);
    console.log('Permisos creados');

    // Crear roles
    const rolesData = [
      { nombre: 'vendedor', descripcion: 'Rol para vendedores' },
      { nombre: 'administrador', descripcion: 'Rol para administradores' },
      { nombre: 'operario', descripcion: 'Rol para operarios' },
      { nombre: 'chofer', descripcion: 'Rol para choferes' },
    ];

    const rolesCreados = await Roles.bulkCreate(rolesData);
    console.log('Roles creados');

    // Asignar permisos a roles
    const permisosPorRol = {
      vendedor: ['iniciar_sesion', 'ver_usuarios'],
      administrador: [
        'iniciar_sesion',
        'ver_permisos',
        'crear_permisos',
        'eliminar_permisos',
        'ver_roles',
        'crear_roles',
        'editar_roles',
        'eliminar_roles',
        'ver_usuarios',
        'crear_usuarios',
        'editar_usuarios',
        'eliminar_usuarios',
      ],
      operario: ['iniciar_sesion'],
      chofer: ['iniciar_sesion'],
    };

    for (const [rolNombre, permisos] of Object.entries(permisosPorRol)) {
      const rol = rolesCreados.find((r) => r.nombre === rolNombre);
      const permisosIds = permisosCreados
        .filter((p) => permisos.includes(p.nombre))
        .map((p) => p.id);

      const relaciones = permisosIds.map((permisoId) => ({
        rolId: rol.id,
        permisoId,
      }));

      await RolesPermisos.bulkCreate(relaciones);
    }

    console.log('Permisos asignados a roles');

    // Crear usuarios
    const usuariosData = [
      {
        rut: '12345678-9',
        nombre: 'Test1',
        apellido: 'Test1',
        email: 'test1.test@example.com',
        password: '$2a$12$ZQOo2VA.6BlbgEmytQhwFufRd8bwkqD9DrV01mAdM/sELMuvfNfp.', // Asegúrate de encriptar las contraseñas en producción
        rolId: rolesCreados.find((r) => r.nombre === 'administrador').id,
      },
      {
        rut: '98765432-1',
        nombre: 'Test2',
        apellido: 'Test2',
        email: 'Test2.test@example.com',
        password: '$2a$12$ZQOo2VA.6BlbgEmytQhwFufRd8bwkqD9DrV01mAdM/sELMuvfNfp.', // Asegúrate de encriptar las contraseñas en producción
        rolId: rolesCreados.find((r) => r.nombre === 'vendedor').id,
      },
    ];

    await Usuarios.bulkCreate(usuariosData);
    console.log('Usuarios creados');

    console.log('Base de datos poblada con éxito.');
  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
  } finally {
    await sequelize.close();
    console.log('Conexión cerrada.');
  }
}

populateDatabase();
