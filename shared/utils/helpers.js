import { Op } from "sequelize";

const createFilter = (filters, fields) => {
  const where = {};
  for (const [key, value] of Object.entries(filters)) {
    if (fields.includes(key) && value) {
      where[key] = typeof value === "string" ? { [Op.like]: `%${value}%` } : value;
    }
  }
  return where;
};

export default createFilter;