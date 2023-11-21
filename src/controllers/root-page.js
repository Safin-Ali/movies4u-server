"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rootRouteHandler = void 0;
const common_utilities_1 = require("../utilities/common-utilities");
exports.rootRouteHandler = (0, common_utilities_1.routeHandler)((_req, res) => {
  res.send(`<h1>this is root page </h1>`);
});