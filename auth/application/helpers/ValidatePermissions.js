import PermisosRepository from "../../infraestructure/repositories/PermisosRepository";

/**
 * Valida que todos los permisos proporcionados existan en la base de datos.
 * @param {Array<number>} permisos - IDs de los permisos a validar.
 * @throws {Error} - Si uno o más permisos no existen.
 */
const validatePermissionsExist = async (permisos) => {
  if (!permisos || permisos.length === 0) return;

  const permisosExistentes = await PermisosRepository.findAll();
  const permisosIdsValidos = permisosExistentes.map((permiso) => permiso.id);

  const permisosInvalidos = permisos.filter((id) => !permisosIdsValidos.includes(id));
  if (permisosInvalidos.length > 0) {
    throw new Error(`Permisos no válidos: ${permisosInvalidos.join(', ')}`);
  }
};

export default validatePermissionsExist;
