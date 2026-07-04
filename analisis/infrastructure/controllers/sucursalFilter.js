function toSucursalId(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null || raw === "") return undefined;

  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : undefined;
}

export function resolveSucursalFilter(req) {
  const fromQuery = toSucursalId(req?.query?.id_sucursal);
  if (fromQuery != null) return fromQuery;

  const scopeMode = String(req?.headers?.["x-scope-mode"] || "").toLowerCase();
  if (scopeMode !== "sucursal") return undefined;

  return toSucursalId(req?.headers?.["x-sucursal-id"]);
}
