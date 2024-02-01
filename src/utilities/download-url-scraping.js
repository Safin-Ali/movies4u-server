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
exports.GenerateLink = exports.empty_downloadUrlTuple = exports.postIdDefultVal = void 0;
const cheerio_1 = require("cheerio");
const common_utilities_1 = require("./common-utilities");
const env_var_1 = require("../config/env-var");
const url_1 = require("url");
const node_fetch_1 = __importDefault(require("node-fetch"));
const _app_1 = require("../app.js");
const color_logger_1 = __importDefault(require("./color-logger"));
const development_mode_1 = __importDefault(require("./development-mode"));
exports.postIdDefultVal = ['', '', ''];
const empty_downloadUrl = {
  link: '',
  size: '0'
};
exports.empty_downloadUrlTuple = [empty_downloadUrl, empty_downloadUrl, empty_downloadUrl];
class MoviePageScrape {
  constructor() {
    this.postIdArr = [...exports.postIdDefultVal];
  }
  getPostId(arg) {
    return __awaiter(this, void 0, void 0, function* () {
      const postIdArr = [...exports.postIdDefultVal];
      try {
        const html = yield (0, common_utilities_1.fetchHtml)(`${env_var_1.movies_db_url}?s=${arg.title}`);
        const $ = (0, cheerio_1.load)(html);
        $('body style, body script').remove();
        const matchesMovies = $('body #primary #post-wrapper .post-wrapper-hentry article');
        if (!matchesMovies.length) return postIdArr;
        matchesMovies.each((_, elm) => {
          const moviePostId = elm.attribs.id.split('-')[1];
          const scrapedTitle = $(elm).find('header.entry-header a').text().toLowerCase();
          if (scrapedTitle.includes(arg.title) && scrapedTitle.includes(arg.year)) {
            switch (this.checkResolution(scrapedTitle)) {
              case '480p':
                postIdArr[0] = moviePostId;
                break;
              case '720p':
                postIdArr[1] = moviePostId;
                break;
              default:
                postIdArr[2] = moviePostId;
                break;
            }
          }
        });
        this.postIdArr = postIdArr;
        return postIdArr;
      } catch (err) {
        (0, common_utilities_1.logError)(err);
        return postIdArr;
      }
    });
  }
  checkResolution(title) {
    if (title.includes('480p')) return '480p';
    if (title.includes('720p')) return '720p';
    return '1080p';
  }
}
class GenerateLink extends MoviePageScrape {
  constructor({
    title,
    year,
    postId
  }) {
    super();
    this.downloadTempUrl = (() => __awaiter(this, void 0, void 0, function* () {
      if (!postId || !postId.length) {
        yield this.getPostId({
          title,
          year
        });
        yield (0, _app_1.useDb)(cl => __awaiter(this, void 0, void 0, function* () {
          yield cl.insertOne({
            title,
            year,
            postId: this.postIdArr,
            driveSeedUrl: [...exports.postIdDefultVal],
            tempLink: exports.empty_downloadUrlTuple
          });
        }));
      } else {
        this.postIdArr = postId;
      }
      const serverArr = yield this.getServerUrl();
      const allResDlLinkP = serverArr.map(s => __awaiter(this, void 0, void 0, function* () {
        try {
          if (!s.fastS) return '';
          const driveSeedPath = yield this.verifyPage(s);
          return driveSeedPath;
        } catch (err) {
          (0, common_utilities_1.logError)(err);
          return '';
        }
      }));
      const driveSeedUrl = yield Promise.all(allResDlLinkP);
      yield (0, _app_1.useDb)(cl => __awaiter(this, void 0, void 0, function* () {
        yield cl.updateOne({
          title,
          year
        }, {
          '$set': {
            'driveSeedUrl': driveSeedUrl
          }
        });
      }));
      const dsDRCLink = driveSeedUrl.map(s => __awaiter(this, void 0, void 0, function* () {
        const resUrl = yield _a.getDirectLinkDRC(s);
        return resUrl;
      }));
      return Promise.all(dsDRCLink);
    }))();
  }
  getServerUrl() {
    return __awaiter(this, void 0, void 0, function* () {
      const resPromiseIns = this.postIdArr.map(id => __awaiter(this, void 0, void 0, function* () {
        const res = yield (0, common_utilities_1.fetchHtml)(`${env_var_1.movies_db_url}/archives/${id}`, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'Content-Type': 'text/html',
            'User-Agent': common_utilities_1.userAgent
          }
        });
        return res;
      }));
      const resSerListP = yield Promise.all(resPromiseIns);
      const resSerList = resSerListP.map(elm => {
        const $ = (0, cheerio_1.load)(elm);
        return {
          fastS: $('a.maxbutton')[0].attribs.href.replace(`${env_var_1.verifyPageUrl}?sid=`, '') || ''
        };
      });
      return resSerList;
    });
  }
  verifyPage(serverObj) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const verifiedS1 = yield (0, common_utilities_1.fetchHtml)(env_var_1.verifyPageUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': common_utilities_1.userAgent
          },
          body: `_wp_http=${serverObj.fastS}`
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
        if (!matches || !matches[1]) return '';
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
          domain: new url_1.URL($('meta')[1].attribs.content.replace('0;url=', '')).origin
        };
        const verifiedDriveSeed = yield (0, common_utilities_1.fetchHtml)(odmRedUrl.redUrl);
        return `${odmRedUrl.domain}${verifiedDriveSeed.match(/window\.location\.replace\("([^"]+)"\)/)[1]}`;
      } catch (err) {
        (0, common_utilities_1.logError)(err);
        return '';
      }
    });
  }
  getUrl() {
    return this.downloadTempUrl;
  }
}
exports.GenerateLink = GenerateLink;
_a = GenerateLink;
GenerateLink.getDirectLinkDRC = driveSeedURL => __awaiter(void 0, void 0, void 0, function* () {
  var _b;
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
    const url = new url_1.URL(driveSeedURL);
    const dsCookie = (_b = dshp.headers.get('Set-Cookie')) === null || _b === void 0 ? void 0 : _b.split(';')[0];
    const dsToken = (0, common_utilities_1.extractDriveSeedKey)(yield dshp.text());
    const formData = new URLSearchParams();
    formData.append('action', 'direct');
    formData.append('key', dsToken);
    formData.append('action_token', '');
    const dsddrResInfo = yield (yield (0, node_fetch_1.default)(url.href, {
      method: 'POST',
      headers: {
        'Cookie': dsCookie,
        'User-Agent': common_utilities_1.userAgent,
        'x-token': url.host
      },
      body: formData
    })).json();
    if (dsddrResInfo.error && !dsddrResInfo.url) throw Error();
    const finalDRCPage = yield (0, common_utilities_1.fetchHtml)(dsddrResInfo.url);
    const workerURLPattern = /let worker_url = '([^']+)';/;
    const matches = finalDRCPage.match(workerURLPattern);
    if (matches && matches.length > 1) {
      const drcLinkStatus = yield (0, common_utilities_1.getURLStatus)(matches[1]);
      const linkSts = (0, common_utilities_1.checkDLUrl)(drcLinkStatus.status);
      if (linkSts) {
        downloadCdn = {
          link: matches[1],
          size: drcLinkStatus.size
        };
      } else {
        (0, development_mode_1.default)(() => color_logger_1.default.warn('DRC valid link is not founded'));
        downloadCdn = yield _a.getDirectLinkDDL(driveSeedURL, url);
      }
    }
    return downloadCdn;
  } catch (_c) {
    (0, development_mode_1.default)(() => color_logger_1.default.error('link is not valid'));
    return downloadCdn;
  }
});
GenerateLink.getDirectLinkDDL = (driveSeedURL, domain) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const dshp = yield (0, common_utilities_1.fetchHtml)(driveSeedURL);
    let $ = (0, cheerio_1.load)(dshp);
    const {
      origin
    } = domain;
    const ddlp = yield (0, common_utilities_1.fetchHtml)(`${origin}${$('a:contains("Direct Links")')[0].attribs.href}`);
    $ = (0, cheerio_1.load)(ddlp);
    const link = $('a:contains("Download")')[0].attribs.href;
    const ddlLinkStatus = yield (0, common_utilities_1.getURLStatus)(link);
    const linkActiveSts = (0, common_utilities_1.checkDLUrl)(ddlLinkStatus.status);
    !linkActiveSts && (0, development_mode_1.default)(() => color_logger_1.default.warn('DDL link is not active'));
    return {
      link: linkActiveSts ? link : '',
      size: ddlLinkStatus.size
    };
  } catch (err) {
    (0, common_utilities_1.logError)(err);
    return {
      link: '',
      size: '0'
    };
  }
});