import express from "express";
import VentasEstadisticasService from "../../application/VentasEstadisticasService.js";
import ProductoEstadisticasService from "../../application/ProductoEstadisticasService.js";

const router = express.Router();

// Obtener estadísticas de ventas por año
router.get("/ventas-estadisticas/:year", async (req, res) => {
  try {
    const { year } = req.params;
    const estadisticas = await VentasEstadisticasService.obtenerPorAno(year);
    res.status(200).json(estadisticas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener estadísticas de ventas por año y mes
router.get("/ventas-estadisticas/:year/:month", async (req, res) => {
  try {
    const { year, month } = req.params;
    const estadisticas = await VentasEstadisticasService.obtenerPorMes(year, month);
    res.status(200).json(estadisticas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener estadísticas de un producto por año
router.get("/productos-estadisticas/:id_producto/:year", async (req, res) => {
  try {
    const { id_producto, year } = req.params;
    const estadisticas = await ProductoEstadisticasService.obtenerPorProductoYAno(
      id_producto,
      year
    );
    res.status(200).json(estadisticas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estadísticas de ventas manualmente
router.post("/actualizar-ventas-estadisticas", async (req, res) => {
  try {
    const { year } = req.body;
    const resultado = await VentasEstadisticasService.calcularEstadisticasPorAno(year);
    res.status(200).json({ message: "Estadísticas actualizadas con éxito.", resultado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estadísticas de productos manualmente
router.post("/actualizar-productos-estadisticas", async (req, res) => {
  try {
    const { id_producto, year } = req.body;
    const resultado = await ProductoEstadisticasService.calcularEstadisticasPorProducto(
      id_producto,
      year
    );
    res.status(200).json({ message: "Estadísticas actualizadas con éxito.", resultado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
