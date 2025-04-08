import authPermisos from "./authPermisos.js";
import entregasPermisos from "./entregasPermisos.js";
import funcionesPermisos from "./funcionesPermisos.js";
import inventarioPermisos from "./inventarioPermisos.js";
import ventasPermisos from "./ventasPermisos.js";
import vistasPermisos from "./vistasPermisos.js";

export default [
  ...authPermisos,
  ...entregasPermisos,
  ...inventarioPermisos,
  ...ventasPermisos,
  ...vistasPermisos,
  ...funcionesPermisos
];
