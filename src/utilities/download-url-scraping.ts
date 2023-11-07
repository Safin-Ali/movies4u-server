import { ResPostIdTuple, MovieDLScrapQuery, ResolutionLiteral, DownloadInfoParams, MovieDLServerReturn, } from '@custom-types/types';
import { load } from 'cheerio';
import { fetchHtml, logError } from './common-utilities';
import { movies_db_url } from '@config/env-var';

class WebScrap {
	private dlUrlArr: ResPostIdTuple = ['', '', ''];
	public postIdArr: ResPostIdTuple = ['', '', ''];

	constructor() {
	}

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

export class GenerateLink extends WebScrap {

}