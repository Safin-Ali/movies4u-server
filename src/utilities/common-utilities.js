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
exports.fetchHtml = exports.extractDriveSeedKey = exports.fetchTMDB = exports.getURLStatus = exports.checkDLUrl = exports.logError = exports.sendServerError = exports.userAgent = exports.routeHandler = void 0;
const env_var_1 = require("../config/env-var");
const color_logger_1 = __importDefault(require("./color-logger"));
const development_mode_1 = __importDefault(require("./development-mode"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const routeHandler = callback => {
  return callback;
};
exports.routeHandler = routeHandler;
exports.userAgent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
function sendServerError(res, statusCode = 500, errorMessage = `Internal Server Error`) {
  res.status(statusCode).json({
    errorMessage: errorMessage
  });
}
exports.sendServerError = sendServerError;
const logError = err => (0, development_mode_1.default)(() => {
  color_logger_1.default.error(err.message);
  color_logger_1.default.process(err.stack || '');
});
exports.logError = logError;
const checkDLUrl = status => {
  if (status === 301 || status === 302 || status === 404 || status !== 200) return false;
  return true;
};
exports.checkDLUrl = checkDLUrl;
const getURLStatus = (url, option) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    if (!option) {
      option = {
        headers: {
          'User-Agent': exports.userAgent
        }
      };
    }
    const httpSts = (yield (0, node_fetch_1.default)(url, Object.assign(Object.assign({}, option), {
      method: 'HEAD'
    }))).status;
    return httpSts;
  } catch (err) {
    (0, exports.logError)(err);
    return 401;
  }
});
exports.getURLStatus = getURLStatus;
const fetchTMDB = (optPrefix = '') => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const response = yield (yield (0, node_fetch_1.default)(`https://api.themoviedb.org/3/${optPrefix}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${env_var_1.tmdb_api}`
      }
    })).json();
    return response;
  } catch (err) {
    (0, exports.logError)(err);
    throw new Error();
  }
});
exports.fetchTMDB = fetchTMDB;
const extractDriveSeedKey = pageStr => {
  const keyRegex = /formData\.append\("key", "([^"]+)"\);/;
  const match = pageStr.match(keyRegex);
  return match ? match[1] : null;
};
exports.extractDriveSeedKey = extractDriveSeedKey;
const fetchHtml = (url, option) => __awaiter(void 0, void 0, void 0, function* () {
  const defaultOpt = {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html',
      'User-Agent': exports.userAgent
    }
  };
  try {
    const response = yield (yield (0, node_fetch_1.default)(url, option || defaultOpt)).text();
    return response;
  } catch (err) {
    (0, exports.logError)(err);
    throw new Error(`Failed to fetch: ${err.message}`);
  }
});
exports.fetchHtml = fetchHtml;