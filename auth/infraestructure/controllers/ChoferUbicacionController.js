import UbicacionChoferService from "../../application/UbicacionChoferService.js";
import UsuariosRepository from "../repositories/UsuariosRepository.js";

class ChoferUbicacionController {
  async registrarUbicacion(req, res) {
    const { rut } = req.params;
    const { lat, lng } = req.body;

    console.log(req.body)

    try {
      if (!lat || !lng) {
        return res.status(400).json({ error: "lat y lng son requeridos" });
      }

      const usuario = await UsuariosRepository.findOne(rut);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      await UbicacionChoferService.registrarUbicacion({
        rut,
        latitud: lat,
        longitud: lng,
        fecha_hora: new Date(),
      });

      res.status(201).json({ success: true, message: "Ubicación registrada" });
    } catch (error) {
      console.error("Error registrando ubicación:", error);
      res.status(500).json({ error: "Error al registrar ubicación" });
    }
  }

  async obtenerUltimaUbicacion(req, res) {
    const { rut } = req.params;

    try {
      const ubicacion = await UbicacionChoferService.obtenerUltimaUbicacion(
        rut
      );

      if (!ubicacion) {
        return res.status(404).json({ error: "Sin ubicación registrada" });
      }

      res.status(200).json({
        rut: ubicacion.rut,
        lat: ubicacion.latitud,
        lng: ubicacion.longitud,
        timestamp: ubicacion.fecha_hora,
      });
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
      res.status(500).json({ error: "Error al obtener ubicación" });
    }
  }
}

export default new ChoferUbicacionController();
