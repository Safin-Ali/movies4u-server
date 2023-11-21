"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMovieById = exports.getMovies = void 0;
const common_utilities_1 = require("../utilities/common-utilities");
const download_url_scraping_1 = require("../utilities/download-url-scraping");
/**
 * Retrieves a list of movies from The Movie Database (TMDB) based on a query.
 * @returns {Promise<void>} - A promise that resolves once the list of movies is sent in the response.
 */
exports.getMovies = (0, common_utilities_1.routeHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const moviesList = yield (0, common_utilities_1.fetchTMDB)(req.query.q);
    res.status(200).send(moviesList);
  } catch (err) {
    (0, common_utilities_1.logError)(err);
    (0, common_utilities_1.sendServerError)(res);
  }
}));
/**
 * Handler for getting movie details info by movie ID and released date.
 *
 * @example `?q=787781&y=2023-09-09`
 * @function
 * @async
 * @returns {Promise<void>} - Resolves when the response is sent.
 * @throws {Error} - Throws an error if there is an issue with fetching data or processing the request.
 */
exports.getMovieById = (0, common_utilities_1.routeHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    // Fetches details of a movie from TMDB.
    const details = yield (0, common_utilities_1.fetchTMDB)(req.query.q);
    // Extracts the year from the provided movie release date.
    const year = req.query.y.split('-')[0];
    const downloadUrl = yield new download_url_scraping_1.GenerateLink({
      title: details.original_title.toLowerCase(),
      year
    }).getUrl();
    // Sends a successful response with movie details and download URL.
    res.status(200).send({
      movieDetails: details,
      downloadUrl
    });
  } catch (err) {
    (0, common_utilities_1.logError)(err);
    (0, common_utilities_1.sendServerError)(res);
  }
}));