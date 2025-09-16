import { Op } from "sequelize";

export default class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  getModel() {
    return this.model;
  }

  pk() {
    const attrs = this.model?.primaryKeyAttributes;
    return attrs?.[0] || "id";
  }

  async create(data, options = {}) {
    return this.model.create(data, options);
  }

  async bulkCreate(rows, options = {}) {
    return this.model.bulkCreate(rows, options);
  }

  async findByPk(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  async findById(id, options = {}) {
    return this.findByPk(id, options);
  }

  async findOne(options = {}) {
    return this.model.findOne(options);
  }

  async findAll(options = {}) {
    return this.model.findAll(options);
  }

  async update(id, data, options = {}) {
    const where = { [this.pk()]: id };
    await this.model.update(data, { ...options, where });
    return this.findByPk(id, options);
  }

  async destroy(id, options = {}) {
    const where = { [this.pk()]: id };
    return this.model.destroy({ ...options, where });
  }

  async destroyWhere(where, options = {}) {
    return this.model.destroy({ ...options, where });
  }

  static dateRange(field, from, to) {
    const where = {};
    if (from && to) where[field] = { [Op.between]: [from, to] };
    else if (from) where[field] = { [Op.gte]: from };
    else if (to) where[field] = { [Op.lte]: to };
    return where;
  }
}
