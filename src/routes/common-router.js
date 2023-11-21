"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.router = void 0;
const root_page_1 = require("../controllers/root-page");
const config_router_1 = __importDefault(require("../utilities/config-router"));
const express_1 = require("express");
// export Router interface function
exports.router = (0, express_1.Router)();
// that will always end of all routes
exports.router.all('/api/*', root_page_1.rootRouteHandler);
exports.default = (0, config_router_1.default)(['/', exports.router]);