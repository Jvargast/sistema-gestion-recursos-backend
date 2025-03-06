import Usuarios from "../../auth/domain/models/Usuarios.js";
import Notificacion from "./Notificacion.js";


function loadNotificacionAssociations() {
  // Relación: Un usuario puede tener muchas notificaciones
  Usuarios.hasMany(Notificacion, {
    foreignKey: "id_usuario",
    as: "notificaciones",
  });

  Notificacion.belongsTo(Usuarios, {
    foreignKey: "id_usuario",
    as: "usuario",
  });

  console.log("Asociaciones de Notificación cargadas.");
}

export default loadNotificacionAssociations;
