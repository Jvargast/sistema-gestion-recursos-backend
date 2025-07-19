/**
 * 
 * @param {Model} model - Modelo Sequelize.
 * @param {Object} options - Opciones de la paginación.
 * @param {Object} queryOptions - Opciones adicionales para la consulta (filtros, relaciones, etc.).
 * @returns {Promise<Object>} - Resultados paginados y metadatos.
 */
async function paginate(model, options, queryOptions = {}) {
  const page = Math.max(1, parseInt(options.page, 10) || 1); 
  const pageSize = Math.max(1, parseInt(options.limit, 10) || 10); 

  const limit = pageSize; 
  const offset = (page - 1) * limit;

  const where = queryOptions.where || {};
  const order = queryOptions.order || [["id", "DESC"]];
  const distinctCol = queryOptions.distinctCol || model.primaryKeyAttribute;
  
  const rows = await model.findAll({
    ...queryOptions,
    order,
    limit,
    offset,
  });

  const count = await model.count({
    where, 
    include: queryOptions.include || [],
    distinct: true, 
    col: distinctCol, 
  });

  const data = rows.map((row, index) => {
    const plainRow = row.toJSON();

    return {
      ...plainRow,
      sequentialId: offset + index + 1, 
    };
  });


  const totalPages = Math.ceil(count / limit);

  return {
    data,
    pagination: {
      totalItems: count,
      totalPages,
      currentPage: page,
      pageSize: limit,
    },
  };
}

export default paginate;
