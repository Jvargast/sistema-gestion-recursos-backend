class SearchService {
  constructor(searchRepository) {
    this.searchRepository = searchRepository;
  }

  async search(query) {
    if (!query || query.length < 2) {
      throw new Error("Debes ingresar al menos 2 caracteres para buscar.");
    }

    let results = await this.searchRepository.generalSearch(query);

    if (results.length === 0) {
      results = await this.searchRepository.partialSearch(query);
    }

    if (results.length === 0) {
      const suggestions = await this.searchRepository.getPopularSuggestions();
      return {
        resultados: [],
        sugerencias: suggestions,
      };
    }

    return {
      resultados: results,
      sugerencias: [],
    };
  }
}

export default SearchService;
