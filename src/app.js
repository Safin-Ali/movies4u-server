"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useDb = exports.expressApp = exports.startServer = void 0;
const env_var_1 = require("./config/env-var");
const _middleware_1 = __importDefault(require("./middleware/middleware.js"));
const routes_1 = __importDefault(require("./routes/routes"));
const express_1 = __importDefault(require("express"));
const color_logger_1 = __importDefault(require("./utilities/color-logger"));
const development_mode_1 = __importDefault(require("./utilities/development-mode"));
const _db_1 = require("./database/db.js");
class App {
  constructor() {
    this.express = express_1.default;
    this.startServer = () => {
      this.expressApp.listen(env_var_1.port, () => {
        (0, development_mode_1.default)(() => color_logger_1.default.process(`The server is running on ${env_var_1.port}`));
      });
    };
    this.expressApp = this.express();
    this.useDb = new _db_1.InitDB().useDb;
    (0, _middleware_1.default)(this.expressApp);
    this.routes = new routes_1.default(this.expressApp);
  }
}
const app = new App();
exports.startServer = app.startServer, exports.expressApp = app.expressApp, exports.useDb = app.useDb;
exports.default = app;