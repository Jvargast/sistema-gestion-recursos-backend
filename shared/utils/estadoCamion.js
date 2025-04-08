export function getEstadoCamion(es_retornable, esDePedido = true) {
  if (esDePedido) {
    return es_retornable
      ? "En Camión - Reservado"
      : "En Camión - Reservado - Entrega";
  } else {
    return "En Camión - Disponible";
  }
}
