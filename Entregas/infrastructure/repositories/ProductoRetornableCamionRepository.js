import Producto from "../../../inventario/domain/models/Producto.js";
import Camion from "../../domain/models/Camion.js";
import Entrega from "../../domain/models/Entrega.js";
import ProductoRetornableCamion from "../../domain/models/ProductoRetornableCamion.js";


class ProductoRetornableCamionRepository {
  async create(data) {
    return await ProductoRetornableCamion.create(data);
  }

  async findById(id) {
    return await ProductoRetornableCamion.findByPk(id, {
      include: [
        { model: Producto, as: "producto" },
        { model: Camion, as: "camion" },
        { model: Entrega, as: "entrega" },
      ],
    });
  }

  async findAllByCamion(id_camion) {
    return await ProductoRetornableCamion.findAll({
      where: { id_camion },
      include: [
        { model: Producto, as: "producto" },
        { model: Entrega, as: "entrega" },
      ],
    });
  }

  async findAllPendientesInspeccion() {
    return await ProductoRetornableCamion.findAll({
      where: { estado: "pendiente_inspeccion" },
      include: [
        { model: Producto, as: "producto" },
        { model: Camion, as: "camion" },
        { model: Entrega, as: "entrega" },
      ],
    });
  }

  async updateEstado(id, nuevoEstado, tipo_defecto = null) {
    return await ProductoRetornableCamion.update(
      { estado: nuevoEstado, tipo_defecto },
      { where: { id_producto_retornable_camion: id } }
    );
  }

  async delete(id) {
    const retornable = await ProductoRetornableCamion.findByPk(id);
    if (!retornable) {
      throw new Error("ProductoRetornableCamion no encontrado");
    }
    return await retornable.destroy();
  }

  getModel() {
    return ProductoRetornableCamion;
  }
}

export default new ProductoRetornableCamionRepository();
