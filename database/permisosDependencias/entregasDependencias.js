const entregasDependencias = [
    // agendacarga
    { permiso: "entregas.agendacarga.crear", dependeDe: "entregas.agendacarga.ver" },
    { permiso: "entregas.agendacarga.editar", dependeDe: "entregas.agendacarga.ver" },
    { permiso: "entregas.agendacarga.eliminar", dependeDe: "entregas.agendacarga.ver" },
    
    // agendaviaje
    { permiso: "entregas.agendaviaje.crear", dependeDe: "entregas.agendaviaje.ver" },
    { permiso: "entregas.agendaviaje.editar", dependeDe: "entregas.agendaviaje.ver" },
    { permiso: "entregas.agendaviaje.eliminar", dependeDe: "entregas.agendaviaje.ver" },
  
    // camión
    { permiso: "entregas.camion.crear", dependeDe: "entregas.camion.ver" },
    { permiso: "entregas.camion.editar", dependeDe: "entregas.camion.ver" },
    { permiso: "entregas.camion.eliminar", dependeDe: "entregas.camion.ver" },
  
    // entrega
    { permiso: "entregas.entrega.crear", dependeDe: "entregas.entrega.ver" },
    { permiso: "entregas.entrega.editar", dependeDe: "entregas.entrega.ver" },
    { permiso: "entregas.entrega.eliminar", dependeDe: "entregas.entrega.ver" },
    
    // historialventaschofer
    { permiso: "entregas.historialventaschofer.crear", dependeDe: "entregas.historialventaschofer.ver" },
    { permiso: "entregas.historialventaschofer.editar", dependeDe: "entregas.historialventaschofer.ver" },
    { permiso: "entregas.historialventaschofer.eliminar", dependeDe: "entregas.historialventaschofer.ver" },
  
    // inventariocamion
    { permiso: "entregas.inventariocamion.crear", dependeDe: "entregas.inventariocamion.ver" },
    { permiso: "entregas.inventariocamion.editar", dependeDe: "entregas.inventariocamion.ver" },
    { permiso: "entregas.inventariocamion.eliminar", dependeDe: "entregas.inventariocamion.ver" },
  
    // inventariocamionlogs
    { permiso: "entregas.inventariocamionlogs.crear", dependeDe: "entregas.inventariocamionlogs.ver" },
    { permiso: "entregas.inventariocamionlogs.editar", dependeDe: "entregas.inventariocamionlogs.ver" },
    { permiso: "entregas.inventariocamionlogs.eliminar", dependeDe: "entregas.inventariocamionlogs.ver" },
  
    // inventariocamionreservas
    { permiso: "entregas.inventariocamionreservas.crear", dependeDe: "entregas.inventariocamionreservas.ver" },
    { permiso: "entregas.inventariocamionreservas.editar", dependeDe: "entregas.inventariocamionreservas.ver" },
    { permiso: "entregas.inventariocamionreservas.eliminar", dependeDe: "entregas.inventariocamionreservas.ver" },
  
    // ventaschofer
    { permiso: "entregas.ventaschofer.crear", dependeDe: "entregas.ventaschofer.ver" },
    { permiso: "entregas.ventaschofer.editar", dependeDe: "entregas.ventaschofer.ver" },
    { permiso: "entregas.ventaschofer.eliminar", dependeDe: "entregas.ventaschofer.ver" },
  ];
  
  export default entregasDependencias;
  