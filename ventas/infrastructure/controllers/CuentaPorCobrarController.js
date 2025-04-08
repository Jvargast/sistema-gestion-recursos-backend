import CuentaPorCobrarService from "../../application/CuentaPorCobrarService.js";
import CuentaPorCobrarRepository from "../repositories/CuentaPorCobrarRepository.js";

class CuentaPorCobrarController {
  async getAll(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
      };

      const filters = { ...req.query };
      delete filters.page;
      delete filters.limit;

      const result = await CuentaPorCobrarService.getAll(options, filters);

      res.status(200).json({
        data: result.data,
        total: result.pagination,
      });
    } catch (error) {
      console.error("Error al obtener cuentas por cobrar:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getCuentaPorCobrarById(req, res) {
    try {
      const { id } = req.params;
      const cuenta = await CuentaPorCobrarService.getById(id);

      if (!cuenta) {
        return res
          .status(404)
          .json({ error: "Cuenta por cobrar no encontrada" });
      }

      res.status(200).json(cuenta);
    } catch (error) {
      console.error("Error al obtener cuenta por cobrar:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getCuentaPdf(req, res) {
    try {
      const id = req.params.id;
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=factura_${id}.pdf`,
      });

      await CuentaPorCobrarService.generarFacturaPdf(id, res);
    } catch (error) {
      console.error("Error generando PDF:", error);
      res.status(500).json({ error: "Error generando PDF" });
    }
  }

  async registrarPago(req, res) {
    try {
      const { id } = req.params;
      const { monto, metodo_pago, observaciones, referencia } = req.body;
      const usuario = req.user;

      const resultado = await CuentaPorCobrarService.registrarPago({
        id_cxc: id,
        monto,
        metodo_pago,
        observaciones,
        usuario,
        referencia,
      });

      res
        .status(200)
        .json({ message: "Pago registrado correctamente", data: resultado });
    } catch (error) {
      console.error("Error al registrar pago:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async actualizarCuenta(req, res) {
    try {
      const { id } = req.params;
      const { estado, fecha_vencimiento, observaciones } = req.body;

      const cuenta = await CuentaPorCobrarRepository.findById(id);
      if (!cuenta)
        return res.status(404).json({ error: "Cuenta no encontrada" });

      if (estado) cuenta.estado = estado;
      if (fecha_vencimiento) cuenta.fecha_vencimiento = fecha_vencimiento;
      if (observaciones) cuenta.observaciones = observaciones;

      await cuenta.save();

      res.status(200).json({
        message: "Cuenta actualizada correctamente",
        data: cuenta,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new CuentaPorCobrarController();
