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
class Routes {
  constructor(app) {
    this.routesPath = [movies_api_router_1.default];
    this.app = app;
    this.routesPath.push(common_router_1.default);
    this.initRoutes();
  }
  initRoutes() {
    this.routesPath.map(rt => this.app.use(rt[0], rt[1]));
  }
}
exports.default = Routes;