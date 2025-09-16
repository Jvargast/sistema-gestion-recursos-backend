import compra from "./CompraRepository.js";
import compraItem from "./CompraItemRepository.js";
import gasto from "./GastoRepository.js";
import proveedor from "./ProveedorRepository.js";
import categoria from "./CategoriaGastoRepository.js";
import centroCosto from "./CentroCostoRepository.js";
import ordenPago from "./OrdenPagoRepository.js";
import ordenPagoItem from "./OrdenPagoItemRepository.js";
import gastoAdjunto from "./GastoAdjuntoRepository.js"

export default {
  compra,
  compraItem,
  gasto,
  gastoAdjunto,
  proveedor,
  categoria,
  centroCosto,
  ordenPago,
  ordenPagoItem,
};
