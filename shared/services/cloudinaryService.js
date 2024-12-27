import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (filePath, folder = "default") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder, // Carpeta dentro de Cloudinary
    });
    return result.secure_url; // URL segura de la imagen
  } catch (error) {
    console.error("Error al subir imagen a Cloudinary:", error);
    throw error;
  }
};

const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Imagen con publicId ${publicId} eliminada.`);
  } catch (error) {
    console.error("Error al eliminar imagen de Cloudinary:", error);
    throw error;
  }
};

export { uploadImage, deleteImage };
