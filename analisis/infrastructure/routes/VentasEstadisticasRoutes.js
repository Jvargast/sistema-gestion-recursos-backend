import express from "express";
import VentasEstadisticasController from "../controllers/VentasEstadisticasController.js"

const router = express.Router();

// CRUD básico
router.get("/:id", VentasEstadisticasController.getEstadisticasPorId); // Obtener estadísticas por ID
router.post("/", VentasEstadisticasController.createEstadisticas); // Crear estadísticas
router.put("/:id", VentasEstadisticasController.updateEstadisticas); // Actualizar estadísticas por ID
router.delete("/:id", VentasEstadisticasController.deleteEstadisticas); // Eliminar estadísticas por ID

// Obtener todas las estadísticas con paginación
router.get("/", VentasEstadisticasController.getAllEstadisticas);

// Estadísticas por tiempo
router.get("/ano/:year", VentasEstadisticasController.obtenerPorAno); // Obtener estadísticas por año
router.get("/ano/:year/mes/:month", VentasEstadisticasController.obtenerPorMes); // Obtener estadísticas por año y mes
router.post("/actualizar/ano", VentasEstadisticasController.actualizarPorAno); // Actualizar estadísticas por año
router.post(
  "/calcular/ano",
  VentasEstadisticasController.calcularEstadisticasPorAno
); // Calcular estadísticas por año

// Monitoreo y actualizaciones globales
router.get(
  "/monitoreo/ventas-recientes",
  VentasEstadisticasController.monitorearVentasRecientes
); // Monitorear ventas recientes
router.post(
  "/actualizar/globales",
  VentasEstadisticasController.actualizarEstadisticasGlobales
); // Actualizar estadísticas globales

export default router;
