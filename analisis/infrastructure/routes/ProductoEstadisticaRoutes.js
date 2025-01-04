import express from "express";
import ProductoEstadisticasController from "../controllers/ProductoEstadisticasController.js";

const router = express.Router();

// Rutas básicas
router.get("/:id", ProductoEstadisticasController.getEstadisticasPorId); // Obtener estadísticas por ID
router.post("/", ProductoEstadisticasController.createEstadisticas); // Crear estadísticas
router.put("/:id", ProductoEstadisticasController.updateEstadisticas); // Actualizar estadísticas por ID
router.delete("/:id", ProductoEstadisticasController.deleteEstadisticas); // Eliminar estadísticas por ID

// Rutas avanzadas
router.get("/", ProductoEstadisticasController.getAllEstadisticas); // Obtener estadísticas con filtros y paginación
router.get(
  "/:id_producto/year/:year",
  ProductoEstadisticasController.obtenerPorProductoYAno
); // Obtener estadísticas por producto y año
router.get(
  "/:id_producto/:year/:month",
  ProductoEstadisticasController.obtenerPorProductoYMes
); // Obtener estadísticas por producto, año y mes
router.post("/calcular", ProductoEstadisticasController.calcularEstadisticas); // Calcular estadísticas para un producto
router.post("/calcular-year", ProductoEstadisticasController.calcularEstadisticasPorAno) // Calcular ventas de productos del año
router.post(
  "/actualizar/:id_producto",
  ProductoEstadisticasController.updateEstadisticasProducto
); // Actualizar estadísticas por producto
router.get(
  "/monitoreo/productos-recientes",
  ProductoEstadisticasController.monitorearProductosRecientes
); // Monitorear productos recientes

export default router;
