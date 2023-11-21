"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const env_var_1 = require("../config/env-var");
/**
 * Execute a callback function only if the current environment is set to 'development'.
 *
 * @param callback - The callback function to be executed in 'development' mode.
 */
const inDevMode = callback => {
  /**
   * The 'node_env' variable stores the current environment mode.
   * It's imported from the '@config/env-var' module.
   */
  // Importing the 'node_env' variable from '@config/env-var'.
  if (env_var_1.node_env !== 'development') return;
  // If the environment is 'development', execute the provided callback function.
  callback();
};
/**
 * Exporting the 'inDevMode' function.
 */
exports.default = inDevMode;