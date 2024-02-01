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
var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMovieById = exports.getMovies = void 0;
const _app_1 = require("../app.js");
const _db_1 = require("../database/db.js");
const color_logger_1 = __importDefault(require("../utilities/color-logger"));
const common_utilities_1 = require("../utilities/common-utilities");
const development_mode_1 = __importDefault(require("../utilities/development-mode"));
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
    const title = details.original_title.toLowerCase();
    const year = req.query.y.split('-')[0];
    const dbFilter = {
      title,
      year
    };
    const info = yield (0, _app_1.useDb)(collection => __awaiter(void 0, void 0, void 0, function* () {
      const val = yield collection.findOne(dbFilter);
      return val;
    }), true);
    let downloadUrlArr = download_url_scraping_1.empty_downloadUrlTuple;
    const callGL = postId => __awaiter(void 0, void 0, void 0, function* () {
      const res = yield new download_url_scraping_1.GenerateLink({
        title,
        year,
        postId
      }).getUrl();
      downloadUrlArr = res;
      _db_1.InitDB.updateTempLink(res, dbFilter);
    });
    if (!info) {
      yield callGL();
    } else {
      const tempLinkSts = yield (0, common_utilities_1.getURLStatus)(info.tempLink[0]);
      const linkStatus = (0, common_utilities_1.checkDLUrl)(tempLinkSts.status);
      if (!linkStatus) {
        (0, development_mode_1.default)(() => color_logger_1.default.warn('links are not valid'));
        const driveSeedPathSts = (0, common_utilities_1.checkDLUrl)((yield (0, common_utilities_1.getURLStatus)(info.driveSeedUrl[0])).status);
        if (driveSeedPathSts) {
          const newActLink = yield Promise.all(info.driveSeedUrl.map(dsPath => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield download_url_scraping_1.GenerateLink.getDirectLinkDRC(dsPath);
            return res;
          })));
          _db_1.InitDB.updateTempLink(newActLink, dbFilter);
          downloadUrlArr = newActLink;
        } else {
          yield callGL(info.postId);
        }
      }
      downloadUrlArr = info.tempLink;
    }
    const encrypt_urls = downloadUrlArr.map(url => {
      return Object.assign(Object.assign({}, url), {
        link: !url.link ? url.link : (0, common_utilities_1.encryptUrl)(url.link)
      });
    });
    res.status(200).send({
      movieDetails: details,
      downloadUrl: encrypt_urls
    });
  } catch (err) {
    (0, common_utilities_1.logError)(err);
    (0, common_utilities_1.sendServerError)(res);
  }
}));