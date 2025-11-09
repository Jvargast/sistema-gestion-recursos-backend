import Caja from "../../../ventas/domain/models/Caja.js";
import Sucursal from "../../domain/models/Sucursal.js";
import UserPreferences from "../../domain/models/UserPreferences.js";
import Usuarios from "../../domain/models/Usuarios.js";

class UserPreferencesRepository {
  /**
   * @param {string} user_rut
   * @returns {Promise<UserPreferences|null>}
   */
  async findByUserRut(user_rut) {
    return await UserPreferences.findOne({
      where: { user_rut },
      include: [
        {
          model: Usuarios,
          as: "preferredVendor",
          attributes: ["rut", "nombre", "apellido", "email"],
        },
        {
          model: Sucursal,
          as: "preferredBranch",
          attributes: ["id_sucursal", "nombre", "direccion"],
        },
        {
          model: Caja,
          as: "preferredCashbox",
          attributes: [
            "id_caja",
            "estado",
            "fecha_apertura",
            "fecha_cierre",
            "id_sucursal",
          ],
        },
      ],
    });
  }

  /**
   * @param {object} data
   * @returns {Promise<UserPreferences>}
   */
  async create(data) {
    return await UserPreferences.create(data);
  }

  /**
   *
   * @param {string} user_rut
   * @param {object} data
   * @returns {Promise<UserPreferences>}
   */
  async upsert(user_rut, data) {
    const existing = await UserPreferences.findOne({ where: { user_rut } });

    if (existing) {
      await existing.update({ ...data, updated_at: new Date() });
      return existing;
    }

    return await UserPreferences.create({
      user_rut,
      ...data,
      updated_at: new Date(),
    });
  }

  /**
   * 
   * @param {string} user_rut
   * @returns {Promise<number>}
   */
  async deleteByUserRut(user_rut) {
    return await UserPreferences.destroy({ where: { user_rut } });
  }

  async findAll() {
    return await UserPreferences.findAll({
      include: [
        {
          model: Usuarios,
          as: "user",
          attributes: ["rut", "nombre", "apellido", "email"],
        },
        {
          model: Sucursal,
          as: "preferredBranch",
          attributes: ["id_sucursal", "nombre"],
        },
        {
          model: Caja,
          as: "preferredCashbox",
          attributes: ["id_caja", "estado"],
        },
      ],
      order: [["updated_at", "DESC"]],
    });
  }

  getModel() {
    return UserPreferences;
  }
}

export default new UserPreferencesRepository();
