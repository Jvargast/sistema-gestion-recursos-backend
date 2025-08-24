import { Op } from "sequelize";

export default function createFilter(
  filters,
  { intFields = [], textFields = [] } = {}
) {
  const where = {};

  for (const [key, raw] of Object.entries(filters)) {
    if (raw === undefined || raw === null || raw === "") continue;

    const value = raw === "null" ? null : raw;

    if (intFields.includes(key)) {
      const n = Number(value);
      if (Number.isFinite(n)) where[key] = n;
      continue;
    }

    if (textFields.includes(key)) {
      where[key] = { [Op.iLike]: `%${String(value)}%` };
      continue;
    }
  }

  return where;
}
