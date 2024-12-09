import express from "express";

const router = express.Router();

router.get("/nuevos", ClientesEstadisticaController.getClientesNuevos);