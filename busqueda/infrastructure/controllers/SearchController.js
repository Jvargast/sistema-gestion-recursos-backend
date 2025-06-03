import SearchService from "../../application/SearchService.js";
import SequelizeSearchRepository from "../repositories/SearchRepository.js";

const searchRepository = new SequelizeSearchRepository();
const searchService = new SearchService(searchRepository);

const searchGeneral = async (req, res) => {
  try {
    const query = req.query.q;
    const results = await searchService.search(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default {
  searchGeneral,
};
