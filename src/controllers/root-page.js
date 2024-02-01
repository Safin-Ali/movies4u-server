"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rootRouteHandler = void 0;
const env_var_1 = require("../config/env-var");
const color_logger_1 = __importDefault(require("../utilities/color-logger"));
const common_utilities_1 = require("../utilities/common-utilities");
const development_mode_1 = __importDefault(require("../utilities/development-mode"));
const node_fetch_1 = __importDefault(require("node-fetch"));
exports.rootRouteHandler = (0, common_utilities_1.routeHandler)((_req, res) => {
  if (_req.headers['awake-key'] === env_var_1.awake_key) {
    setTimeout(() => {
      (0, node_fetch_1.default)(env_var_1.self_domain, {
        method: 'HEAD',
        headers: {
          'User-Agent': common_utilities_1.userAgent,
          'awake-key': env_var_1.awake_key
        }
      });
      (0, development_mode_1.default)(() => {
        color_logger_1.default.process('Awaked');
      });
      res.send('Awaked');
    }, 780 * 1000);
  } else {
    res.send('Welcome MOVIES4U SERVER');
  }
});