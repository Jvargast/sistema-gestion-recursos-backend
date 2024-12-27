import CamionRepository from "../infrastructure/repositories/CamionRepository.js";

class CamionService {
    async createCamion(data) {
      const { placa, capacidad, estado } = data;
  
      if (!placa || !capacidad) {
        throw new Error('Missing required fields: placa, capacidad');
      }
  
      return await CamionRepository.create({ placa, capacidad, estado });
    }
  
    async getCamionById(id) {
      const camion = await CamionRepository.findById(id);
      if (!camion) {
        throw new Error('Camion not found');
      }
      return camion;
    }
  
    async getAllCamiones() {
      return await CamionRepository.findAll();
    }
  
    async updateCamion(id, data) {
      return await CamionRepository.update(id, data);
    }
  
    async deleteCamion(id) {
      return await CamionRepository.delete(id);
    }
  }
  
  export default new CamionService();