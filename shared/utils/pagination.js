/**
 * Aplica la paginación a una consulta en Sequelize.
 * @param {Model} model - Modelo Sequelize.
 * @param {Object} options - Opciones de la paginación.
 * @param {Object} queryOptions - Opciones adicionales para la consulta (filtros, relaciones, etc.).
 * @returns {Promise<Object>} - Resultados paginados y metadatos.
 */
async function paginate(model, options, queryOptions = {}) {
  const page = Math.max(1, parseInt(options.page, 10) || 1); // Página >= 1
  const pageSize = Math.max(1, parseInt(options.limit, 10) || 10); // Tamaño >= 1

  const limit = pageSize; // Filas por página
  const offset = (page - 1) * limit; // Desplazamiento


  const order = queryOptions.order || [["id", "DESC"]];
  // Obtener los resultados paginados
  const { count, rows } = await model.findAndCountAll({
    ...queryOptions,
    order,
    limit,
    offset,
  });

  // Asignar un ID secuencial global basado en el índice absoluto
  const data = rows.map((row, index) => {
    // Usa el método `toJSON` para convertir cada instancia en un objeto plano
    const plainRow = row.toJSON();

    return {
      ...plainRow,
      sequentialId: offset + index + 1, // ID único basado en la paginación
    };
  });

  console.log("Filas devueltas:", rows.length);

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
