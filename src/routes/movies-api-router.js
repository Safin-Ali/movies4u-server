"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
const config_router_1 = __importDefault(require("../utilities/config-router"));
const common_router_1 = require("./common-router");
const retrive_movies_data_1 = require("../controllers/retrive-movies-data");
common_router_1.router.get('/movies', retrive_movies_data_1.getMovies);
common_router_1.router.get('/movie', retrive_movies_data_1.getMovieById);
common_router_1.router.get('/temp_link', retrive_movies_data_1.getTempLink);
exports.default = (0, config_router_1.default)(['/api', common_router_1.router]);