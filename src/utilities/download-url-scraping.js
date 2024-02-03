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
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.movieLinkTuple = exports.empty_downloadUrlTuple = void 0;
const common_utilities_1 = require("./common-utilities");
const env_var_1 = require("../config/env-var");
const cheerio_1 = require("cheerio");
const node_fetch_1 = __importDefault(require("node-fetch"));
const color_logger_1 = __importDefault(require("./color-logger"));
const development_mode_1 = __importDefault(require("./development-mode"));
const _db_1 = require("../database/db.js");
const _app_1 = require("../app.js");
const resoluationTuple = ['480p', '720p', '1080p'];
const empty_downloadUrl = {
  link: '',
  size: '0'
};
exports.empty_downloadUrlTuple = [empty_downloadUrl, empty_downloadUrl, empty_downloadUrl];
class MoviePostId {
  static getPostId(query) {
    return __awaiter(this, void 0, void 0, function* () {
      let postId = '';
      let hq_postId = '';
      let bit_postId = '';
      try {
        const html = yield (0, common_utilities_1.fetchHtml)(`${env_var_1.movies_db_url}?s=${query.title}`);
        const $ = (0, cheerio_1.load)(html);
        $('body style, body script').remove();
        const matchesMovies = $('body #primary #post-wrapper .post-wrapper-hentry article');
        if (!matchesMovies.length) return postId;
        matchesMovies.each((_, elm) => {
          const moviePostId = elm.attribs.id.split('-')[1];
          const scrapedTitle = $(elm).find('header.entry-header a').text().toLowerCase();
          if (scrapedTitle.includes(query.title) && scrapedTitle.includes(query.year) && scrapedTitle.startsWith(query.title) && scrapedTitle.includes(resoluationTuple[query.resolutionIndex])) {
            if (scrapedTitle.includes('hq')) {
              hq_postId = hq_postId ? hq_postId : moviePostId;
            } else if (scrapedTitle.includes('10bit') || scrapedTitle.includes('bit')) {
              bit_postId = bit_postId ? bit_postId : moviePostId;
            } else {
              postId = postId ? postId : moviePostId;
            }
          }
        });
        return postId ? postId : bit_postId ? bit_postId : hq_postId;
      } catch (err) {
        (0, common_utilities_1.logError)(err);
        return postId;
      }
    });
  }
}
class FileHostedServers {
  static getServerUrl(postId) {
    return __awaiter(this, void 0, void 0, function* () {
      const res = yield (0, common_utilities_1.fetchHtml)(`${env_var_1.movies_db_url}/archives/${postId}`, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/html',
          'User-Agent': common_utilities_1.userAgent
        }
      });
      const $ = (0, cheerio_1.load)(res);
      const fastSOnly = $('a.maxbutton')[0].attribs.href.replace(`${env_var_1.verifyPageUrl}?sid=`, '') || '';
      return fastSOnly;
    });
  }
}
class VerifyMiddleWeb {
  static verifyPage(server_path) {
    return __awaiter(this, void 0, void 0, function* () {
      let driveSeedPath = '';
      try {
        const verifiedS1 = yield (0, common_utilities_1.fetchHtml)(env_var_1.verifyPageUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': common_utilities_1.userAgent
          },
          body: `_wp_http=${server_path}`
        });
        let $ = (0, cheerio_1.load)(verifiedS1);
        const formElm = $(`body form`);
        const tempToken = {
          nextPgUrl: formElm[0].attribs.action,
          _wp_http2: ``,
          token: ''
        };
        formElm.find('input').each((_, {
          attribs
        }) => {
          if (attribs.name === '_wp_http2') tempToken._wp_http2 = `${encodeURIComponent(attribs.value)}`;
          if (attribs.name === 'token') tempToken.token = `token=${encodeURIComponent(attribs.value)}`;
        });
        const verifiedS2 = yield (0, common_utilities_1.fetchHtml)(tempToken.nextPgUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': common_utilities_1.userAgent
          },
          body: `_wp_http2=${tempToken._wp_http2}&${tempToken.token}`
        });
        const pattern = /s_343\('(.*?)'/;
        const matches = verifiedS2.match(pattern);
        if (!matches || !matches[1]) return driveSeedPath;
        const redirectPage = yield (0, common_utilities_1.fetchHtml)(`${env_var_1.verifyPageUrl}?go=${matches[1]}`, {
          method: 'GET',
          headers: {
            'Cookie': `${matches[1]}=${tempToken._wp_http2}`,
            'User-Agent': common_utilities_1.userAgent
          }
        });
        $ = (0, cheerio_1.load)(redirectPage);
        const odmRedUrl = {
          redUrl: $('meta')[1].attribs.content.replace('0;url=', ''),
          domain: new URL($('meta')[1].attribs.content.replace('0;url=', '')).origin
        };
        const verifiedDriveSeed = yield (0, common_utilities_1.fetchHtml)(odmRedUrl.redUrl);
        driveSeedPath = `${odmRedUrl.domain}${verifiedDriveSeed.match(/window\.location\.replace\("([^"]+)"\)/)[1]}`;
        return driveSeedPath;
      } catch (err) {
        (0, common_utilities_1.logError)(err);
        return driveSeedPath;
      }
    });
  }
}
class RetriveDirectLink {
  findUrl(driveSeedUrl) {
    return __awaiter(this, void 0, void 0, function* () {
      let link = yield this.getDirectLinkDRC(driveSeedUrl);
      if (link.link) return link;
      link = yield this.getDirectLinkDDL(driveSeedUrl);
      return link;
    });
  }
  getDirectLinkDRC(driveSeedURL) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      let downloadCdn = {
        link: '',
        size: '0'
      };
      try {
        const dshp = yield (0, node_fetch_1.default)(driveSeedURL, {
          headers: {
            'User-Agent': common_utilities_1.userAgent
          }
        });
        const {
          href,
          host
        } = new URL(driveSeedURL);
        const dsCookie = (_a = dshp.headers.get('Set-Cookie')) === null || _a === void 0 ? void 0 : _a.split(';')[0];
        const dsToken = (0, common_utilities_1.extractDriveSeedKey)(yield dshp.text());
        const formData = new URLSearchParams();
        formData.append('action', 'direct');
        formData.append('key', dsToken);
        formData.append('action_token', '');
        const dsddrResInfo = yield (yield (0, node_fetch_1.default)(href, {
          method: 'POST',
          headers: {
            'Cookie': dsCookie,
            'User-Agent': common_utilities_1.userAgent,
            'x-token': host
          },
          body: formData
        })).json();
        if (dsddrResInfo.error && !dsddrResInfo.url) return downloadCdn;
        const finalDRCPage = yield (0, common_utilities_1.fetchHtml)(dsddrResInfo.url);
        const workerURLPattern = /let worker_url = '([^']+)';/;
        const matches = finalDRCPage.match(workerURLPattern);
        if (matches && matches.length > 1) {
          const {
            size,
            status,
            content_type
          } = yield (0, common_utilities_1.getURLStatus)(matches[1]);
          const linkSts = (0, common_utilities_1.checkDLUrl)({
            status,
            content_type
          });
          if (linkSts) {
            downloadCdn = {
              link: matches[1],
              size: size
            };
          } else {
            (0, development_mode_1.default)(() => color_logger_1.default.error('crash on DRC fetching '));
            return downloadCdn;
          }
        }
        return downloadCdn;
      } catch (_b) {
        (0, development_mode_1.default)(() => color_logger_1.default.error('DRC link is something wrong'));
        return downloadCdn;
      }
    });
  }
  getDirectLinkDDL(driveSeedURL) {
    return __awaiter(this, void 0, void 0, function* () {
      let downloadCdn = {
        link: '',
        size: '0'
      };
      try {
        const dshp = yield (0, common_utilities_1.fetchHtml)(driveSeedURL);
        let $ = (0, cheerio_1.load)(dshp);
        const {
          origin
        } = new URL(driveSeedURL);
        const ddlp = yield (0, common_utilities_1.fetchHtml)(`${origin}${$('a:contains("Direct Links")')[0].attribs.href}`);
        $ = (0, cheerio_1.load)(ddlp);
        const link = $('a:contains("Download")')[0].attribs.href;
        const {
          size,
          status,
          content_type
        } = yield (0, common_utilities_1.getURLStatus)(link);
        const linkActiveSts = (0, common_utilities_1.checkDLUrl)({
          content_type,
          status
        });
        !linkActiveSts && (0, development_mode_1.default)(() => color_logger_1.default.warn('DDL link is not active'));
        downloadCdn = {
          link: linkActiveSts ? link : '',
          size: size || '0'
        };
        return downloadCdn;
      } catch (err) {
        (0, common_utilities_1.logError)(err);
        (0, development_mode_1.default)(() => color_logger_1.default.error('crash on DDL fetching '));
        return downloadCdn;
      }
    });
  }
}
class GenerateLink {
  static fromBegin(query) {
    return __awaiter(this, void 0, void 0, function* () {
      const movieLinkInfo = {
        driveSeedUrl: ['', '', ''],
        title: query.title,
        year: query.year,
        postId: ['', '', ''],
        tempLink: [...exports.empty_downloadUrlTuple],
        lastUpdate: new Date().setHours(new Date().getHours() + 23, new Date().getMinutes() + 50)
      };
      for (let i = 1; i <= query.resolution; i++) {
        const postId = yield MoviePostId.getPostId({
          title: query.title,
          year: query.year,
          resolutionIndex: i - 1
        });
        movieLinkInfo.postId[i - 1] = postId;
        const fastS = yield FileHostedServers.getServerUrl(postId);
        const driveSeed = yield VerifyMiddleWeb.verifyPage(fastS);
        movieLinkInfo.driveSeedUrl[i - 1] = driveSeed;
        const finalLink = yield new RetriveDirectLink().findUrl(driveSeed);
        movieLinkInfo.tempLink[i - 1] = finalLink;
      }
      return movieLinkInfo;
    });
  }
  static fromPostId(postId) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const fastS = yield FileHostedServers.getServerUrl(postId);
        const driveSeed = yield VerifyMiddleWeb.verifyPage(fastS);
        const finalLink = yield new RetriveDirectLink().findUrl(driveSeed);
        return finalLink;
      } catch (err) {
        (0, common_utilities_1.logError)(err);
        return empty_downloadUrl;
      }
    });
  }
  static fromDriveSeed(driveSeedPath) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const directLink = yield new RetriveDirectLink().findUrl(driveSeedPath);
        return directLink;
      } catch (err) {
        (0, common_utilities_1.logError)(err);
        return empty_downloadUrl;
      }
    });
  }
}
const movieLinkTuple = query => __awaiter(void 0, void 0, void 0, function* () {
  const {
    title,
    year
  } = query;
  let finalResVal = [...exports.empty_downloadUrlTuple];
  const existInDB = yield _db_1.InitDB.findMovieLink({
    title,
    year
  });
  if (existInDB) {
    for (let i = 0; i < existInDB.tempLink.length; i++) {
      const {
        content_type,
        status
      } = yield (0, common_utilities_1.getURLStatus)(existInDB.tempLink[i].link);
      const sts = (0, common_utilities_1.checkDLUrl)({
        content_type,
        status
      });
      if (sts) {
        finalResVal[i] = existInDB.tempLink[i];
        continue;
      }
      const driveSeedSts = yield (0, common_utilities_1.getURLStatus)(existInDB.driveSeedUrl[i]);
      if (driveSeedSts.status === 200) {
        const newLink = yield GenerateLink.fromDriveSeed(existInDB.driveSeedUrl[i]);
        finalResVal[i] = newLink;
        continue;
      }
      const fixedLink = yield GenerateLink.fromPostId(existInDB.postId[i]);
      finalResVal[i] = fixedLink;
    }
    yield _db_1.InitDB.updateTempLink(finalResVal, query);
    return finalResVal;
  }
  const newMovieLinkInfo = yield GenerateLink.fromBegin(Object.assign(Object.assign({}, query), {
    resolution: 3
  }));
  yield (0, _app_1.useDb)(cl => __awaiter(void 0, void 0, void 0, function* () {
    try {
      yield cl.insertOne(newMovieLinkInfo);
    } catch (err) {
      color_logger_1.default.error(`Movie Link Info Can't Stored In DataBase`);
      (0, common_utilities_1.logError)(err);
    }
  }), true);
  finalResVal = newMovieLinkInfo.tempLink;
  return finalResVal;
});
exports.movieLinkTuple = movieLinkTuple;