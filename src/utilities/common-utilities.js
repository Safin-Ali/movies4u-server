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
exports.fetchHtml = exports.fetchTMDB = exports.logError = exports.sendServerError = exports.routeHandler = void 0;
const env_var_1 = require("../config/env-var");
const color_logger_1 = __importDefault(require("./color-logger"));
const development_mode_1 = __importDefault(require("./development-mode"));
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * Creates a route handler function.
 * @param {RouteHandlerType} callback - The callback function that handles the route.
 *
 * @description
 * `Note 1:` This define default return and req type is `void` and `Request` ⇦⇦ express.
 *
 * `Note 2`: `callback` function accept two `Arguments`. first will be `Request` Object and second is `Response` object.
 *
 * `Note 3`: If you want to use `custom type` then use `generic` type with first `Argument` is `return` type of callback and second will be `request` type.
 *
 * @returns {RouteHandlerType} - The route handler function.
 * @example
 * // Define a handler function
 *	const myHandler = (req, res) => {
 *		const queryVal = req.params;
 *		res.send('Hello, World!',queryVal);
 * };
 *
 * // creating custom types alias
 *
 * type CustomReturnType = Promised<void>
 *
 * //for CustomReqType you need to import Request type from express.
 *
 * type CustomReqType = Request & {
 * body: {name:string ...etc},
 * query: {search:string ...etc},
 * }
 *
 * // Define a handler function with custom type
 *
 * const myHandler = <Promise<void>,CustomReqType> (req, res) => {
    const queryVal = req.params;
    res.send('Hello, World!', queryVal);
    }
 *
 * // Create a route handler using routeHandler
 * const routeHandlerFunction = routeHandler(myHandler);
 *
 * // Use routeHandlerFunction as an Express route handler
 * app.get('/my-route', routeHandlerFunction);
 */
const routeHandler = callback => {
  return callback;
};
exports.routeHandler = routeHandler;
/**
 * Sends a server-side error message to the client with the specified HTTP status code.
 * @param {Response} res - The HTTP response object.
 * @param {number} statusCode - The HTTP status code to be sent to the client.
 * @param {string} errorMessage - The error message to be sent to the client.
 */
function sendServerError(res, statusCode = 500, errorMessage = `Internal Server Error`) {
  res.status(statusCode).json({
    errorMessage: errorMessage
  });
}
exports.sendServerError = sendServerError;
/**
 * Logs an error message to the `console` in `development environment`.
 * @param {Error} err - The error message to be logged.
 * @returns {void}
 */
const logError = err => (0, development_mode_1.default)(() => {
  color_logger_1.default.error(err.message);
  color_logger_1.default.process(err.stack || '');
});
exports.logError = logError;
/**
 * Fetches JSON data from the specified URL.
 * @param {string} optPrefix - The `path` or `query` or `params`
 * @returns {Promise<any>} - A promise that resolves to the parsed JSON data.
 * @throws {Error} - If there is an error during the fetch request or parsing of the JSON data.
 */
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
/**
 * Fetches HTML content from a given URL.
 * @param {string} url - The URL to fetch the HTML content from.
 * @param {any} option - Request Header Option.
 * @returns {Promise<string>} A promise that resolves to the HTML content.
 * @throws {Error} If the fetch operation fails.
 */
const fetchHtml = (url, option) => __awaiter(void 0, void 0, void 0, function* () {
  const defaultOpt = {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html'
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