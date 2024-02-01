import { DirectLinkResponse, DriveSeedDRCRes, MoviePostIdArg, GenerateLinkArg, FinalResponseTuple, MovieDLScrapQuery, MovieLinkInfoDB } from '@custom-types/types';
import { checkDLUrl, extractDriveSeedKey, fetchHtml, getURLStatus, logError, userAgent } from './common-utilities';
import { movies_db_url, verifyPageUrl } from '@config/env-var';
import { load } from 'cheerio';
import nodeFetch from 'node-fetch';
import logger from './color-logger';
import inDevMode from './development-mode';
import { InitDB } from '@db';
import { useDb } from '@app';

const resoluationTuple = ['480p', '720p', '1080p'];

const empty_downloadUrl = {
	link: '',
	size: '0'
};

export const empty_downloadUrlTuple: FinalResponseTuple = [empty_downloadUrl, empty_downloadUrl, empty_downloadUrl];

class MoviePostId {
	public static async getPostId(query: MoviePostIdArg): Promise<string> {
		let postId = '';

		// HQ title postId
		let hq_postId = '';

		//10Bit or any audio
		let bit_postId = '';

		try {
			const html = await fetchHtml(`${movies_db_url}?s=${query.title}`);

			// Loads HTML content to create a cheerio instance.
			const $ = load(html);

			// Remove all script and style elements from the body.
			$('body style, body script').remove();

			// Get the element of all collected matches movies name
			const matchesMovies = $('body #primary #post-wrapper .post-wrapper-hentry article');

			// if no one movies found then send empty string
			if (!matchesMovies.length) return postId;

			matchesMovies.each((_, elm) => {
				// movie post id
				/**
					 * movie post id that will be require for next route
					 */
				const moviePostId = elm.attribs.id.split('-')[1];

				// the current movie element header or extract title
				const scrapedTitle = $(elm).find('header.entry-header a').text().toLowerCase();

				if (
					scrapedTitle.includes(query.title)
					&&
					scrapedTitle.includes(query.year)
					&&
					scrapedTitle.startsWith(query.title)
					&&
					scrapedTitle.includes(resoluationTuple[query.resolutionIndex])
				) {
					if(scrapedTitle.includes('hq')) {

						// that ternary operator used for tricks to add always latest postId

						hq_postId = hq_postId ? hq_postId : moviePostId;
					}
					else if(scrapedTitle.includes('10bit') || scrapedTitle.includes('bit')) {

						// that ternary operator used for tricks to add always latest postId
						bit_postId = bit_postId ? bit_postId : moviePostId;
					}
					else {

						// that ternary operator used for tricks to add always latest postId

						postId = postId ? postId : moviePostId;
					}
				}
			});
			return postId ? postId : bit_postId ? bit_postId : hq_postId;
		} catch (err: any) {
			logError(err);
			return postId;
		}
	}
}

class FileHostedServers {

	public static async getServerUrl(postId: string): Promise<string> {

		/**
		 * get post id server source page
		 */
		const res: string = await fetchHtml(`${movies_db_url}/archives/${postId}`, {
			method: 'GET',
			redirect: 'follow',
			headers: {
				'Content-Type': 'text/html',
				'User-Agent': userAgent
			},
		});

		// retrieve current resoluation `fastServer`, `googleDrive`, `othersLink` url

		const $ = load(res);

		/**
		 * currently only retrieve fastServer only.
		 * that's why we only created fastOnly veriable
		 * if iwant to each servers url then just make a loop
		 * finaly we get on just path for verifyPafeUrl
		 */
		const fastSOnly = $('a.maxbutton')[0].attribs.href.replace(`${verifyPageUrl}?sid=`, '') || '';

		return fastSOnly;
	}
}

class VerifyMiddleWeb {
	/**
	 *
	 * verify middle position third party site
	 *
	 * @param {string} server_path
	 * @returns
	 */

	public static async verifyPage(server_path: string): Promise<string> {
		let driveSeedPath = '';

		try {

			// Step 1:

			const verifiedS1 = (await fetchHtml(verifyPageUrl!, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'User-Agent': userAgent
				},
				body: `_wp_http=${server_path}`,
			}));

			//cheerio load varified step 1 page content
			let $ = load(verifiedS1);

			// get form element
			const formElm = $(`body form`);

			// temporary credential for generating refresh url
			const tempToken = {
				nextPgUrl: formElm[0].attribs.action,
				_wp_http2: ``,
				token: ''
			};

			// find input element and retrieve _wp_http2 token and encoded refresh token
			formElm.find('input').each((_, { attribs }) => {
				if (attribs.name === '_wp_http2') tempToken._wp_http2 = `${encodeURIComponent(attribs.value)}`;
				if (attribs.name === 'token') tempToken.token = `token=${encodeURIComponent(attribs.value)}`;
			});

			// Step 2:

			// get odm step 2 verified page for retrieve decoded refresh token
			const verifiedS2 = await fetchHtml(tempToken.nextPgUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'User-Agent': userAgent
				},
				body: `_wp_http2=${tempToken._wp_http2}&${tempToken.token}`
			});

			// a regular expression pattern to match the content within the first pair of single quotes for s_343 which had to decoded refresh token.
			const pattern = /s_343\('(.*?)'/;

			// Use the regular expression to find the first argument value of s_343 function
			const matches = verifiedS2.match(pattern);

			if (!matches || !matches[1]) return driveSeedPath;

			// retrieve verified redirect page html
			const redirectPage = await fetchHtml(`${verifyPageUrl}?go=${matches[1]}`, {
				method: 'GET',
				headers: {
					'Cookie': `${matches[1]}=${tempToken._wp_http2}`,
					'User-Agent': userAgent
				}
			});

			// load redirect page html
			$ = load(redirectPage);

			// odm redirect page meta tag for refresh driveseed url
			const odmRedUrl = {
				redUrl: $('meta')[1].attribs.content.replace('0;url=', ''),
				domain: new URL($('meta')[1].attribs.content.replace('0;url=', '')).origin
			};

			// verified driveseed page html
			const verifiedDriveSeed = await fetchHtml(odmRedUrl.redUrl);

			// finally extract driveseed path where the video is stored with super fast link
			driveSeedPath = `${odmRedUrl.domain}${verifiedDriveSeed.match(/window\.location\.replace\("([^"]+)"\)/)[1]}`;
			return driveSeedPath;

		} catch (err: any) {
			logError(err);
			return driveSeedPath;
		}
	}
}

class RetriveDirectLink {

	public async findUrl(driveSeedUrl: string) {

		// actual download url
		/**
		 * first try to direct download button
		 * if not link then try to direct download link
		 */
		let link = await this.getDirectLinkDRC(driveSeedUrl);

		if (link.link) return link;

		link = await this.getDirectLinkDDL(driveSeedUrl);
		return link;
	}

	/**
	* scrap driveseed direct download button and retrieve link.
	* @param {string} driveSeedURL - driveseed current movie path url.
	*/
	private async getDirectLinkDRC(driveSeedURL: string): Promise<DirectLinkResponse> {

		// store valid download url
		let downloadCdn: DirectLinkResponse = {
			link: '',
			size: '0'
		};

		try {
			// get dirveseed home page
			const dshp = await nodeFetch(driveSeedURL, {
				headers: {
					'User-Agent': userAgent
				}
			});

			// get domain name from this params
			const { href, host } = new URL(driveSeedURL);

			// temp cookie for driveseed file direct download button
			const dsCookie = dshp.headers.get('Set-Cookie')?.split(';')[0];

			// get refresh token value
			const dsToken = extractDriveSeedKey(await dshp.text());

			const formData = new URLSearchParams();
			formData.append('action', 'direct');
			formData.append('key', dsToken!);
			formData.append('action_token', '');

			// get driveseed direct download response json
			const dsddrResInfo: DriveSeedDRCRes = await (await nodeFetch(href, {
				method: 'POST',
				headers: {
					'Cookie': dsCookie!,
					'User-Agent': userAgent,
					'x-token': host
				},
				body: formData
			})).json();

			if (dsddrResInfo.error && !dsddrResInfo.url) return downloadCdn;

			// driveseed direct download redirected page html
			const finalDRCPage = await fetchHtml(dsddrResInfo.url);

			// Extracting worker_url value using regex pattern
			const workerURLPattern = /let worker_url = '([^']+)';/;
			const matches = finalDRCPage.match(workerURLPattern);

			if (matches && matches.length > 1) {

				// get founded url video total size and status
				const { size, status, content_type } = await getURLStatus(matches[1]);

				// link status active or not
				const linkSts = checkDLUrl({ status, content_type });

				if (linkSts) {
					downloadCdn = {
						link: matches[1],
						size: size
					};
				} else {
					inDevMode(() => logger.error('crash on DRC fetching '));
					return downloadCdn;
				}
			}
			return downloadCdn;
		} catch {
			// here will be anothers site scrap class
			inDevMode(() => logger.error('DRC link is something wrong'));
			return downloadCdn;
		}
	}

	/**
	 *
	 * if DRC url can't retrive then that is the alternate way to get DDL url
	 *
	 * @param driveSeedURL
	 * @param domain
	 * @returns {Promise<string>}
	 */
	private async getDirectLinkDDL(driveSeedURL: string): Promise<DirectLinkResponse> {

		// store valid download url
		let downloadCdn: DirectLinkResponse = {
			link: '',
			size: '0'
		};

		try {

			// get dirveseed home page html
			const dshp = await fetchHtml(driveSeedURL);

			// load cheerio resolved page html
			let $ = load(dshp);


			// get domain name from this params
			const { origin } = new URL(driveSeedURL);

			// direct download server page html
			const ddlp = await fetchHtml(`${origin}${$('a:contains("Direct Links")')[0].attribs.href}`);

			// update $ cheerio load previous html to ddlp resolved html
			$ = load(ddlp);

			// select direct download server page download button 1
			const link = $('a:contains("Download")')[0].attribs.href;

			// get founded url video total size and status
			const { size, status, content_type } = await getURLStatus(link);

			// link header status
			const linkActiveSts = checkDLUrl({ content_type, status });

			!linkActiveSts && inDevMode(() => logger.warn('DDL link is not active'));

			downloadCdn = {
				link: linkActiveSts ? link : '',
				size: size || '0'
			};

			return downloadCdn;

		} catch (err: any) {
			logError(err);
			inDevMode(() => logger.error('crash on DDL fetching '));
			return downloadCdn;
		}
	}
}

class GenerateLink {

	public static async fromBegin(query: GenerateLinkArg) {
		const movieLinkInfo: MovieLinkInfoDB = {
			driveSeedUrl:['','',''],
			title:query.title,
			year:query.year,
			postId:['','',''],
			tempLink:[...empty_downloadUrlTuple],
			lastUpdate:new Date().setHours(new Date().getHours() + 23, new Date().getMinutes() + 50),
		};

		for (let i = 1; i <= query.resolution; i++) {
			const postId = await MoviePostId.getPostId({
				title: query.title,
				year: query.year,
				resolutionIndex: i - 1
			});

			// store postId based on index in movieLinkInfo
			movieLinkInfo.postId[i-1] = postId;

			const fastS = await FileHostedServers.getServerUrl(postId);

			const driveSeed = await VerifyMiddleWeb.verifyPage(fastS);

			// store driveSeedPath based on index in movieLinkInfo
			movieLinkInfo.driveSeedUrl[i-1] = driveSeed;

			const finalLink = await new RetriveDirectLink().findUrl(driveSeed);

			movieLinkInfo.tempLink[i - 1] = finalLink;
		}

		/**
		 * fallback
		 * when each response is empty then from here
		 * you can scrap another site
		 */

		return movieLinkInfo;
	}

	public static async fromPostId(postId: string) {
		try {
			const fastS = await FileHostedServers.getServerUrl(postId);

			const driveSeed = await VerifyMiddleWeb.verifyPage(fastS);

			const finalLink = await new RetriveDirectLink().findUrl(driveSeed);

			return finalLink;
		} catch (err:any) {
			logError(err);
			return empty_downloadUrl;
		}
	}

	public static async fromDriveSeed(driveSeedPath: string) {
		try {
			const directLink: DirectLinkResponse = await new RetriveDirectLink().findUrl(driveSeedPath);
			return directLink;
		} catch (err: any) {
			logError(err);
			return empty_downloadUrl;
		}
	}

}

/**
 *
 * `A guide to how this function work`
 *
 * step 1 check this movie link previously stored or not
 *
 * @param {MovieDLScrapQuery} query
 */

export const movieLinkTuple = async (query: MovieDLScrapQuery):Promise<FinalResponseTuple> => {
	const { title, year } = query;

	let finalResVal: FinalResponseTuple = [...empty_downloadUrlTuple];

	/*

	step 1 check this movie link previously stored or not

	store movie old link info by  using `title`, `years`

	 */
	const existInDB: MovieLinkInfoDB = await InitDB.findMovieLink({
		title,
		year
	});

	/*

	1.if database has movie info and check last update date is today then return the current stored info

	2.this is help for reduce unnecessery scrap or make new link

	*/

	if (existInDB && existInDB.lastUpdate > Date.now()) {
		finalResVal = existInDB.tempLink;
		return finalResVal;
	}

	/*

	after last update not match cheching already stored tempLink all url

	*/

	if (existInDB && existInDB.lastUpdate <= Date.now()) {

		/*
		1. iterate and check link is valid or not

		2. if link is valid then update finalResVal variable value based on index

		3. if not valid then driveseed path and check driveseed path is actived or not

		4. if driveed status 200 and content return type text/html then call GenerateLink.fromDriveSeed method else GenerateLink.fromPostId

		5. then return and update database with finalResVal variable value

		*/
		for (let i = 0; i < existInDB.tempLink.length; i++) {


			const { content_type, status } = await getURLStatus(existInDB.tempLink[i].link);

			const sts = checkDLUrl({ content_type, status });

			if (sts) {
				finalResVal[i] = existInDB.tempLink[i];
				continue;
			}

			// check driveseed path http status
			const driveSeedSts = await getURLStatus(existInDB.driveSeedUrl[i]);

			if (driveSeedSts.status === 200) {
				const newLink = await GenerateLink.fromDriveSeed(existInDB.driveSeedUrl[i]);

				finalResVal[i] = newLink;
				continue;
			}

			// if driveseed path is not valid then fetch from postId
			const fixedLink = await GenerateLink.fromPostId(existInDB.postId[i]);

			finalResVal[i] = fixedLink;

		}

		await InitDB.updateTempLink(finalResVal,query);

		return finalResVal;
	}

	/*

	if database has not info about this movie then scrap from begin and retutn tempLink with insert current movie link info database

	*/

	// a new data for current movie link info to store in database
	const newMovieLinkInfo:MovieLinkInfoDB = await GenerateLink.fromBegin({...query,resolution:3});

	await useDb(async (cl) => {
		try {
			await cl.insertOne(newMovieLinkInfo);
		} catch (err:any) {
			logger.error(`Movie Link Info Can't Stored In DataBase`);
			logError(err);
		}
	},true);

	finalResVal = newMovieLinkInfo.tempLink;

	return finalResVal;
};