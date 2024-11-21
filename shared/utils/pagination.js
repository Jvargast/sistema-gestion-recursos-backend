/**
 * Aplica la paginación a una consulta en Sequelize.
 * @param {Model} model - Modelo Sequelize.
 * @param {Object} options - Opciones de la paginación.
 * @param {Object} queryOptions - Opciones adicionales para la consulta (filtros, relaciones, etc.).
 * @returns {Promise<Object>} - Resultados paginados y metadatos.
 */
async function paginate(model, options, queryOptions = {}) {
    const { page = 1, pageSize = 10 } = options;
  
    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;
  
    // Obtener los resultados paginados
    const { count, rows } = await model.findAndCountAll({
      ...queryOptions,
      limit,
      offset,
    });
  
    const totalPages = Math.ceil(count / limit);
  
    return {
      data: rows,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: parseInt(page, 10),
        pageSize: limit,
      },
    };
  }
  
  export default paginate;
  