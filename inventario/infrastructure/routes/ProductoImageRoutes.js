import express from "express";
import multer from "multer";
import path from "path";
import { uploadImage } from "../../../shared/services/cloudinaryService.js";

const router = express.Router();

// Configuración de Multer para manejar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images"); // Directorio temporal para almacenar imágenes
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Endpoint para subir imágenes
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se ha proporcionado una imagen" });
    }

    const filePath = path.resolve(req.file.path); // Ruta del archivo temporal
    const folder = "productos"; // Carpeta en Cloudinary

    // Subir imagen a Cloudinary
    const imageUrl = await uploadImage(filePath, folder);

    // Elimina el archivo temporal si es necesario
    // fs.unlinkSync(filePath);

    res.status(200).json({ message: "Imagen subida correctamente", imageUrl });
  } catch (error) {
    console.error("Error al subir la imagen:", error);
    res.status(500).json({ error: "Error al subir la imagen" });
  }
});

export default router;
