"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
var _a;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InitDB = void 0;
const _app_1 = require("../app.js");
const env_var_1 = require("../config/env-var");
const color_logger_1 = __importDefault(require("../utilities/color-logger"));
const common_utilities_1 = require("../utilities/common-utilities");
const development_mode_1 = __importDefault(require("../utilities/development-mode"));
const mongodb_1 = require("mongodb");
class InitDB {
  constructor() {
    this.useDb = (callB, close) => __awaiter(this, void 0, void 0, function* () {
      try {
        yield this.dbInstance.connect();
        (0, development_mode_1.default)(() => {
          color_logger_1.default.success('Connected successfully to db');
        });
        const collection = this.dbInstance.db(env_var_1.dbName).collection('MOVIES');
        const data = yield callB(collection);
        if (close) {
          yield this.dbInstance.close();
          color_logger_1.default.process('Server Closed');
        }
        return data;
      } catch (err) {
        (0, common_utilities_1.logError)(err);
      }
    });
    this.dbInstance = new mongodb_1.MongoClient(env_var_1.db_uri);
  }
}
exports.InitDB = InitDB;
_a = InitDB;
InitDB.updateTempLink = (tempLinkArr, {
  title,
  year
}) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const dbFilter = {
      title,
      year
    };
    yield (0, _app_1.useDb)(cl => __awaiter(void 0, void 0, void 0, function* () {
      yield cl.updateOne(dbFilter, {
        '$set': {
          'tempLink': tempLinkArr
        }
      });
    }));
  } catch (err) {
    (0, common_utilities_1.logError)(err);
  }
});