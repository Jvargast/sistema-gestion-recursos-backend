export function getEstadoCamion(es_retornable, esDePedido = true) {
  if (es_retornable) return "En Camión - Reservado";
  return esDePedido
    ? "En Camión - Reservado - Entrega"
    : "En Camión - Disponible";
}
