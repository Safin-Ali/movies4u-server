"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
const common_router_1 = __importDefault(require("./common-router"));
const movies_api_router_1 = __importDefault(require("./movies-api-router"));
/**
 * Represents a class for managing and registering routes in an Express application.
 */
class Routes {
  /**
   * Creates a new instance of the Routes class.
   *
   * @param {Application} app - The Express application instance to which routes will be added.
   */
  constructor(app) {
    /**
     * An array containing custom router configurations to be added to the Express application.
     * You should populate this array with your exported routers.
     */
    this.routesPath = [movies_api_router_1.default];
    this.app = app;
    // For common routes or route middleware, like route.all()
    this.routesPath.push(common_router_1.default);
    this.initRoutes();
  }
  /**
   * Initializes and adds the registered routes to the Express application.
   */
  initRoutes() {
    this.routesPath.map(rt => this.app.use(rt[0], rt[1]));
  }
}
exports.default = Routes;