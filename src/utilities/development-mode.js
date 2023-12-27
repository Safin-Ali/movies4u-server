"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const env_var_1 = require("../config/env-var");
const inDevMode = callback => {
  if (env_var_1.node_env !== 'development') return;
  callback();
};
exports.default = inDevMode;