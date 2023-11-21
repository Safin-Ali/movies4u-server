"use strict";

/**
 * @module app
 */
var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expressApp = exports.startServer = void 0;
const env_var_1 = require("./config/env-var");
const _middleware_1 = __importDefault(require("./middleware/middleware.js"));
const routes_1 = __importDefault(require("./routes/routes"));
const express_1 = __importDefault(require("express"));
const color_logger_1 = __importDefault(require("./utilities/color-logger"));
const development_mode_1 = __importDefault(require("./utilities/development-mode"));
/**
 * Represents the main application class.
 * @class
 */
class App {
  /**
   * Creates an instance of App.
   * Initializes the Express.js application, middleware, routes, and database.
   * @constructor
   */
  constructor() {
    /**
     * The Express.js application instance.
     * @private
     * @type {Express}
     */
    this.express = express_1.default;
    /**
     * Starts the server and listens on the specified port.
     * @public
     */
    this.startServer = () => {
      this.expressApp.listen(env_var_1.port, () => {
        (0, development_mode_1.default)(() => color_logger_1.default.process(`The server is running on ${env_var_1.port}`));
      });
    };
    this.expressApp = this.express();
    (0, _middleware_1.default)(this.expressApp);
    this.routes = new routes_1.default(this.expressApp);
  }
}
/**
 * The main application instance.
 * @type {App}
 */
const app = new App();
exports.startServer = app.startServer, exports.expressApp = app.expressApp;
exports.default = app;