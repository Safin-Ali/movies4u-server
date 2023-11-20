import { ResPostIdTuple, MovieDLScrapQuery, ResolutionLiteral, DownloadInfoParams, MovieDLServerReturn, MovieDLServer } from '@custom-types/types';
import { load } from 'cheerio';
import { fetchHtml, logError } from './common-utilities';
import { movies_db_url } from '@config/env-var';
import { URL } from 'url';
import nodeFetch from 'node-fetch';

/**
 * this class for scrape the movie actual page by `seraching`
 * where the movie each `480p` `720p` `1080p` url stored and
 * finally store `Post Id` array
 */
class MoviePageScrape {
	public postIdArr: ResPostIdTuple = ['', '', ''];

	/**
	 *
	 * search movies by title and year and return matched movie post id based on resolulation
	 *
	 * if not found then return empty `array`.
	 *
	 * @param {MovieDLScrapQuery} arg -  title and year for find movie post id.
	 * @returns {ResPostIdTuple} `array of post id`.
	 */

	public async getPostId(arg: MovieDLScrapQuery): Promise<ResPostIdTuple> {
		// movie res visiting page post id
		const postIdArr: ResPostIdTuple = ['', '', ''];
		try {
			const html = await fetchHtml(`${movies_db_url}?s=${arg.title}`);

			// Loads HTML content to create a cheerio instance.
			const $ = load(html);

			// Remove all script and style elements from the body.
			$('body style, body script').remove();

			// Get the element of all collected matches movies name
			const matchesMovies = $('body #primary #post-wrapper .post-wrapper-hentry article');

			// if no one movies found then send empty string
			if (!matchesMovies.length) return postIdArr;


			matchesMovies.each((_, elm) => {
				// movie post id
				/**
					 * movie post id that will be require for next route
					 */
				const moviePostId = elm.attribs.id.split('-')[1];

				// // the current movie element header
				const scrapedTitle = $(elm).find('header.entry-header a').text().toLowerCase();

				if (scrapedTitle.includes(arg.title) && scrapedTitle.includes(arg.year)) {

					/**
						 * Stores download URLs.
						 * The array order is `important` for `resolutions` `['480p', '720p', '1080p']`.
						 * @type {string}
						*/
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
		} catch (err: any) {
			logError(err);
			return postIdArr;
		}
	}

	/**
	 * checking resolution types are `480p`, `720p`, `1080p`.
	 *
	 * @param {string} title - title for checking included resolution or not
	 * @returns {ResolutionLiteral} - An string which would be `480p` || `720p` || `1080p`.
	 */

	private checkResolution(title: string): ResolutionLiteral {

		/**
			 * Resolution types are '480p', '720p', '1080p'.
			* Always sets the latest or last matched resolution URL.
		*/

		// Sets the download URL based on resolution type.
		if (title.includes('480p')) return '480p';
		if (title.includes('720p')) return '720p';
		return '1080p';

	}
}

/**
 * this class scrape and bypass human
 * verification and return actual movie link
 */
export class GenerateLink extends MoviePageScrape {

	private downloadUrl:Promise<ResPostIdTuple>;

	constructor({ title, year }: DownloadInfoParams) {

		// call the WebScrap class
		super();
		// automatic set download link tuple promise
		this.downloadUrl = (async () => {
			let downloadLinkArr:ResPostIdTuple;
			await this.getPostId({ title, year });

			const serverArr = await this.getServerUrl();

			// for all video all resolution download link promise
			const allResDlLinkP = serverArr.map(async (s) => {
				try {
					if(!s.fastS) return '';
					const driveSeedPath = await this.verifyPage(s);
					const downloadLink = await this.getDirectLink(driveSeedPath);
					return downloadLink;
				} catch (err:any) {
					logError(err);
					return '';
				}
			});

			// set allResDlLinkP resolved promised value
			return Promise.all(allResDlLinkP) as Promise<ResPostIdTuple>;
		})();
	}

	/**
	 * get the serverUrl for 480p, 720p, 1080p `resolution`.
	 * `Note`: the return array order same as resolution tuple order.
	 * @return {MovieDLServerReturn} - array tuple with three type url object.
	 */
	private async getServerUrl():Promise<MovieDLServerReturn> {

		/**
		 * get every post id server source page `promise`
		 */
		const resPromiseIns = this.postIdArr.map(async (id) => {
			const res = await fetchHtml(`${movies_db_url}/archives/${id}`);
			return res;
		});

		// resolve server source page `promise`
		const resSerListP = await Promise.all(resPromiseIns);

		// iterate every page and retrieve current resoluation `fastServer`, `googleDrive`, `othersLink` url
		const resSerList = resSerListP.map((elm): MovieDLServer => {
			const $ = load(elm);
			return {
				fastS: $('a.maxbutton')[0].attribs.href.replace('https://oddfirm.com/?id=','') || '',
				gDrive: $('a.maxbutton')[1].attribs.href.replace('https://oddfirm.com/?id=','') || '',
				others: $('a.maxbutton')[2].attribs.href.replace('https://oddfirm.com/?id=','') || '',
			};

		});

		return resSerList as MovieDLServerReturn;
	}

	/**
	 *
	 * @param {MovieDLServer} serverObj
	 * @returns
	 */
	private async verifyPage(serverObj:MovieDLServer):Promise<string> {
		try{
			// Step 1:

			// get odm step 1 verified page for retrieve cookie token from html
			const verifiedS1 = await fetchHtml('https://oddfirm.com/',{
				method:'POST',
				headers:{
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: `_wp_http=${serverObj.fastS}`,
			});

			//cheerio load varified step 1 page content
			let $ = load(verifiedS1);

			// get form element
			const formElm = $(`body form`);

			// temporary credential for generating refresh url
			const tempToken = {
				nextPgUrl:formElm[0].attribs.action,
				_wp_http2:``,
				token:''
			};

			// find input element and retrieve _wp_http2 token and encoded refresh token
			formElm.find('input').each((_,{attribs}) => {
				if(attribs.name === '_wp_http2') tempToken._wp_http2 = `${encodeURIComponent(attribs.value)}`;
				if(attribs.name === 'token') tempToken.token = `token=${encodeURIComponent(attribs.value)}`;
			});

			// Step 2:

			// get odm step 2 verified page for retrieve decoded refresh token
			const verifiedS2 = await fetchHtml(tempToken.nextPgUrl,{
				method:'POST',
				headers:{
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body:`_wp_http2=${tempToken._wp_http2}&${tempToken.token}`
			});

			// a regular expression pattern to match the content within the first pair of single quotes for s_343 which had to decoded refresh token.
			const pattern = /s_343\('(.*?)'/;

			// Use the regular expression to find the first argument value of s_343 function
			const matches = verifiedS2.match(pattern);

			if(!matches || !matches[1]) return '';

			// retrieve verified redirect page html
			const redirectPage = await fetchHtml(`https://oddfirm.com/?go=${matches[1]}`,{
				method:'GET',
				headers:{
					'Cookie' : `${matches[1]}=${tempToken._wp_http2}`
				}
			});

			// load redirect page html
			$ = load(redirectPage);

			// odm redirect page meta tag for refresh driveseed url
			const odmRedUrl = {
				redUrl:$('meta')[1].attribs.content.replace('0;url=',''),
				domain:new URL($('meta')[1].attribs.content.replace('0;url=','')).origin
			};

			// verified driveseed page html
			const verifiedDriveSeed = await fetchHtml(odmRedUrl.redUrl);

			// finally extract driveseed path where the video is stored with super fast link
			return `${odmRedUrl.domain}${verifiedDriveSeed.match(/window\.location\.replace\("([^"]+)"\)/)[1]}`;

		} catch(err:any) {
			logError(err);
			return '';
		}
	}

	/**
	 * scrap driveseed `gofile.io` button and retrieve link.
	 * @param {string} driveSeed - driveseed current movie path url.
	 * @param {DownloadLinkServerType} server - the server type for retrieve active download url `default server is 'gofile'`
	 */

	private async getDirectLink (driveSeed:string):Promise<string> {

		let dlCdnUrl:string = '';

		// get dirveseed home page html
		const dshp = await fetchHtml(driveSeed);

		// load cheerio resolved page html
		let $ = load(dshp);

		// get domain name from this params
		const origin = new URL(driveSeed).origin;

		// get link from dirveseed home page gofile.io button
		await (async ():Promise<void> => {
			try {
				const link = $('a:contains("gofile.io")')[0].attribs.href;
				// link header status
				const linkActiveSts = (await nodeFetch(link,{
					method:'HEAD',
					redirect:'manual'
				})).status;
				this.checkDlUrl(linkActiveSts);
				dlCdnUrl = link;

			} catch (err:any) {
				logError(err);
			}
		})();

		// try to direct link page server
		if(!dlCdnUrl) {
			// get link from direct download link server page
			await (async():Promise<void> => {
				try{
				// direct download server page html
					const ddlp = await fetchHtml(`${origin}${$('a:contains("Direct Links")')[0].attribs.href}`);

					// update $ cheerio load previous html to ddlp resolved html
					$ = load(ddlp);

					// select direct download server page download button 1
					const link = $('a:contains("Download")')[0].attribs.href;
					// link header status
					const linkActiveSts = (await nodeFetch(link,{
						method:'HEAD',
						redirect:'manual'
					})).status;
					this.checkDlUrl(linkActiveSts);
					dlCdnUrl = link;

				} catch (err:any) {
					logError(err);
				}
			})();
		}

		return dlCdnUrl;

	}

	// to get download link tuple promises
	public getUrl ():typeof this.downloadUrl {
		return this.downloadUrl;
	}

	// throw error if the download link is not active or redirect 301 or 302 status found
	private checkDlUrl (status: number):Error | void {
		if(status === 301 || status === 302) throw Error ('link is not active');
	}

}