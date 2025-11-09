import UserPreferencesRepository from "../infraestructure/repositories/UserPreferencesRepository.js";
import Usuarios from "../domain/models/Usuarios.js";
import Sucursal from "../domain/models/Sucursal.js";
import Caja from "../../ventas/domain/models/Caja.js";

function roleName(rol) {
  if (!rol) return "";
  return typeof rol === "string"
    ? rol.toLowerCase()
    : (rol?.nombre || "").toLowerCase();
}
const isAdmin = (rol) => roleName(rol) === "administrador";
const isSeller = (rol) => roleName(rol) === "vendedor";

function nn(v) {
  return typeof v === "undefined" ? null : v;
}

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequestError";
    this.status = 400;
  }
}
class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = "ForbiddenError";
    this.status = 403;
  }
}

const UserPreferencesService = {
  /**
   * @param {{rut: string, rol: any}} currentUser
   */
  async getMine(currentUser) {
    if (!currentUser?.rut) throw new ForbiddenError("Usuario no autenticado");
    const rec = await UserPreferencesRepository.findByUserRut(currentUser.rut);
    if (!rec) {
      return {
        user_rut: currentUser.rut,
        preferred_vendor_rut: isSeller(currentUser.rol)
          ? currentUser.rut
          : null,
        preferred_branch_id: null,
        preferred_cashbox_id: null,
        pos_sticky: true,
        updated_at: null,
      };
    }
    return {
      user_rut: rec.user_rut,
      preferred_vendor_rut: rec.preferred_vendor_rut,
      preferred_branch_id: rec.preferred_branch_id,
      preferred_cashbox_id: rec.preferred_cashbox_id,
      pos_sticky: rec.pos_sticky,
      updated_at: rec.updated_at,
    };
  },

  /**
   * @param {{rut: string, rol: any}} currentUser
   * @param {{preferred_vendor_rut?: string|null, preferred_branch_id?: number|null, preferred_cashbox_id?: number|null, pos_sticky?: boolean}} payload
   */
  async saveMine(currentUser, payload = {}) {
    if (!currentUser?.rut) throw new ForbiddenError("Usuario no autenticado");

    let {
      preferred_vendor_rut,
      preferred_branch_id,
      preferred_cashbox_id,
      pos_sticky,
    } = payload;

    preferred_vendor_rut = nn(preferred_vendor_rut);
    preferred_branch_id = nn(preferred_branch_id);
    preferred_cashbox_id = nn(preferred_cashbox_id);

    if (isSeller(currentUser.rol)) {
      preferred_vendor_rut = currentUser.rut;
    } else if (isAdmin(currentUser.rol)) {
      if (preferred_vendor_rut) {
        const vendor = await Usuarios.findOne({
          where: { rut: preferred_vendor_rut, activo: true },
        });
        if (!vendor)
          throw new BadRequestError(
            "preferred_vendor_rut inválido: usuario no existe o inactivo"
          );
      }
    } else {
      preferred_vendor_rut = currentUser.rut;
    }

    let branch = null;
    if (preferred_branch_id) {
      branch = await Sucursal.findByPk(preferred_branch_id);
      if (!branch)
        throw new BadRequestError(
          "preferred_branch_id inválido: sucursal no existe"
        );
    }

    let cashbox = null;
    if (preferred_cashbox_id) {
      cashbox = await Caja.findByPk(preferred_cashbox_id);
      if (!cashbox)
        throw new BadRequestError(
          "preferred_cashbox_id inválido: caja no existe"
        );

      if (
        preferred_branch_id &&
        Number(cashbox.id_sucursal) !== Number(preferred_branch_id)
      ) {
        throw new BadRequestError(
          "La caja seleccionada no pertenece a la sucursal indicada"
        );
      }

      if (preferred_vendor_rut && cashbox.usuario_asignado) {
        if (String(cashbox.usuario_asignado) !== String(preferred_vendor_rut)) {
          throw new BadRequestError(
            "La caja seleccionada no está asignada al vendedor indicado"
          );
        }
      }
    }

    const saved = await UserPreferencesRepository.upsert(currentUser.rut, {
      preferred_vendor_rut,
      preferred_branch_id,
      preferred_cashbox_id,
      ...(typeof pos_sticky === "boolean" ? { pos_sticky } : {}),
    });

    return {
      user_rut: saved.user_rut,
      preferred_vendor_rut: saved.preferred_vendor_rut,
      preferred_branch_id: saved.preferred_branch_id,
      preferred_cashbox_id: saved.preferred_cashbox_id,
      pos_sticky: saved.pos_sticky,
      updated_at: saved.updated_at,
    };
  },
};

export default UserPreferencesService;
