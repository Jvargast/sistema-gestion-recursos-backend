import { hashPassword } from "../../shared/utils/hashPassword.js";
import EmpresaRepository from "../infraestructure/repositories/EmpresaRepository.js";
import RolRepository from "../infraestructure/repositories/RolRepository.js";
import SucursalRepository from "../infraestructure/repositories/SucursalRepository.js";
import UsuariosRepository from "../infraestructure/repositories/UsuariosRepository.js";

const registerDemo = async ({ nombre, apellido, email, rut, password }) => {
  const existe = await UsuariosRepository.findByEmail(email);
  if (existe) throw new Error("Correo ya en uso");

  const rolDemo = await RolRepository.findByName("demo");
  if (!rolDemo) throw new Error("Rol demo no configurado");

  const empresaDemo = await EmpresaRepository.getEmpresaByNombre(
    "Empresa Demo"
  );
  const sucursalDemo = await SucursalRepository.getSucursalByNombre(
    "Sucursal Demo"
  );
  if (!empresaDemo || !sucursalDemo)
    throw new Error("Empresa o sucursal demo no existen");

  const fechaExpiracion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 

  await UsuariosRepository.create({
    rut,
    nombre,
    apellido,
    email,
    password: await hashPassword(password),
    rolId: rolDemo.id,
    id_empresa: empresaDemo.id_empresa,
    id_sucursal: sucursalDemo.id_sucursal,
    tipo_cuenta: "demo",
    fecha_expiracion: fechaExpiracion,
  });

  return { success: true };
};

export default { registerDemo };
