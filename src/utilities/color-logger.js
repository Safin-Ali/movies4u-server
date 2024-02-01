"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const colorize = (message, colorCode) => `\x1b[${colorCode}m${message}\x1b[0m`;
const logger = function () {
  return {
    error: message => console.error(colorize(message, 31)),
    process: message => console.log(colorize(message, 34)),
    warn: message => console.warn(colorize(message, 33)),
    success: message => console.log(colorize(message, 32))
  };
}();
exports.default = logger;