import DemoService from "../../application/DemoService.js";

const DemoController = {
  async registerDemo(req, res) {
    try {
      await DemoService.registerDemo(req.body);
      res.status(201).json({ message: "Cuenta demo creada correctamente." });
    } catch (error) {
      console.error("Error al registrar cuenta demo:", error.message);
      res.status(400).json({ error: error.message });
    }
  },
};

export default DemoController;
