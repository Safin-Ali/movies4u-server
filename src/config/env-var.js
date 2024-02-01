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
exports.self_domain = exports.encryption_key = exports.encryption_iv = exports.awake_key = exports.verifyPageUrl = exports.dbName = exports.db_uri = exports.tmdb_api = exports.movies_db_url = exports.node_env = exports.port = void 0;
const color_logger_1 = __importDefault(require("../utilities/color-logger"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const env = process.env;
if (env.node_env === undefined && env.port === undefined) color_logger_1.default.warn('==> Environment Variable Missing In Root Directory <==');
_a = {
  port: env.PORT || 5000,
  movies_db_url: env.MOVIES_DB_URL,
  node_env: env.NODE_ENV,
  tmdb_api: env.TMDB_API,
  db_uri: env.DB_URI,
  dbName: env.DB_NAME,
  verifyPageUrl: env.ODM_URL,
  encryption_key: env.ENCRYPTION_KEY,
  encryption_iv: env.ENCRYPTION_IV,
  awake_key: env.AWAKE_KEY,
  self_domain: env.SELF_DOMAIN
}, exports.port = _a.port, exports.node_env = _a.node_env, exports.movies_db_url = _a.movies_db_url, exports.tmdb_api = _a.tmdb_api, exports.db_uri = _a.db_uri, exports.dbName = _a.dbName, exports.verifyPageUrl = _a.verifyPageUrl, exports.awake_key = _a.awake_key, exports.encryption_iv = _a.encryption_iv, exports.encryption_key = _a.encryption_key, exports.self_domain = _a.self_domain;