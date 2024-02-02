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
exports.getTempLink = exports.getMovieById = exports.getMovies = void 0;
const common_utilities_1 = require("../utilities/common-utilities");
const download_url_scraping_1 = require("../utilities/download-url-scraping");
exports.getMovies = (0, common_utilities_1.routeHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const moviesList = yield (0, common_utilities_1.fetchTMDB)(req.query.q);
    res.status(200).send(moviesList);
  } catch (err) {
    (0, common_utilities_1.logError)(err);
    (0, common_utilities_1.sendServerError)(res);
  }
}));
exports.getMovieById = (0, common_utilities_1.routeHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const details = yield (0, common_utilities_1.fetchTMDB)(req.query.q);
    res.status(200).send(details);
  } catch (err) {
    (0, common_utilities_1.logError)(err);
    (0, common_utilities_1.sendServerError)(res);
  }
}));
exports.getTempLink = (0, common_utilities_1.routeHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const title = req.query.title.toLowerCase();
    const year = req.query.year.split('-')[0];
    const downloadUrlTuple = yield (0, download_url_scraping_1.movieLinkTuple)({
      title,
      year
    });
    const encrypt_urls = downloadUrlTuple.map(url => {
      return Object.assign(Object.assign({}, url), {
        link: !url.link ? url.link : (0, common_utilities_1.encryptUrl)(url.link)
      });
    });
    res.send({
      temporary_links: encrypt_urls
    });
  } catch (err) {
    (0, common_utilities_1.logError)(err);
    (0, common_utilities_1.sendServerError)(res);
  }
}));