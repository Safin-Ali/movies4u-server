"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
var _a;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tmdb_api = exports.movies_db_url = exports.node_env = exports.port = void 0;
const color_logger_1 = __importDefault(require("../utilities/color-logger"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from a .env file
dotenv_1.default.config();
// Access environment variables
const env = process.env;
/**
 * If .env file missing in root directory then print
 * ==> Environment Variable Missing In Root Directory <==
 */
if (env.node_env === undefined && env.port === undefined) color_logger_1.default.warn('==> Environment Variable Missing In Root Directory <==');
/**
 * Configuration object containing MongoDB URI, port, and Node.js environment.
 *
 * @namespace
 * @property {number} port - The port on which the application will listen.
 * @property {string} node_env - The Node.js environment (e.g., 'development', 'production').
 */
_a = {
  port: env.PORT || 5000,
  movies_db_url: env.MOVIES_DB_URL,
  node_env: env.NODE_ENV,
  tmdb_api: env.TMDB_API
}, exports.port = _a.port, exports.node_env = _a.node_env, exports.movies_db_url = _a.movies_db_url, exports.tmdb_api = _a.tmdb_api;