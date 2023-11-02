import { DownloadUrlTuple, MovieDLScrapQuery, } from '@custom-types/types';
import { load } from 'cheerio';
import { fetchMovieHtml, logError, sendServerError } from './common-utilities';


/**
 *
 * search movies by title and lang and return matched movie visit or single page `url`
 *
 * @param {string} html - html as a string for `manipulate`.
 * @param {MovieDLScrapQuery} query - for matching movie `title` and `language`.
 * @returns {string} string of `movie details pageUrl`.
 */

export const getPageUrl = (html: string, { lang, title, year }: MovieDLScrapQuery): string => {

	// Loads HTML content to create a cheerio instance.
	const $ = load(html);

	// Remove all script and style elements from the body.
	$('body style, body script').remove();

	// Get the element of all collected matches movies name
	const matchesMovies = $('body #content_box .post-cards article.latestPost h2.title.front-view-title a');

	// visit page url
	let pageUrl: string = '';

	// if no one movies found then send empty string
	if (!matchesMovies.length) return pageUrl;

	matchesMovies.each((_, elm) => {
		// movie page path
		const visitUrl = elm.attribs.href;

		// movie title
		const scrapedTitle = $(elm).text().toLowerCase();

		if (scrapedTitle.includes(`download ${title.toLowerCase()}`) && scrapedTitle.includes(lang.toLowerCase()) && scrapedTitle.includes(year))
			pageUrl = visitUrl;
	});

	return pageUrl;
};

/**
 * Retrieves download URLs based on the provided HTML content.
 *
 * @param {string} html - The `HTML` content to parse.
 * @returns {DownloadUrlTuple} - An array containing download URLs for resolutions `['480p', '720p', '1080p']`.
 */

const getDownloadUrl = (html: string):DownloadUrlTuple  => {

	// Loads HTML content to create a cheerio instance.
	const $ = load(html);

	// Remove all script and style elements from the body.
	$('body style, body script').remove();

	/**
	 * Get all donwload button elments previous `h3` or `h4` element.
	 * that will be determine and set movie downalod url based on `resolution` type.
	 */
	const dlHeader = $('body #content_box .single_post .thecontent.clearfix a.maxbutton-1.maxbutton.maxbutton-download-links').parent('p').prev('h3,h4');

	/**
	 * Stores download URLs.
	 * The array order is `important` for `resolutions` `['480p', '720p', '1080p']`.
	 * @type {Array<string>}
	 */
	const dlStatus: DownloadUrlTuple = ['', '', ''];

	/**
		 * Iterates through the found button elements preceding header elements.
		 * Resolution types are '480p', '720p', '1080p'.
		 * Always sets the latest or last matched resolution URL.
		 */
	dlHeader.each((_, elm) => {

		/**
		 * The text content of the current header element (h3 or h4).
		 * @type {string}
		 */
		const currH: string = $(elm).text();

		/**
		 * The download URL associated with the current header element.
		 * @type {string}
		 */
		const downloadUrl: string = $(elm).next('p:first').children('a').attr('href')!;

		// Sets the download URL based on resolution type.
		if (currH.includes('480p'))
			dlStatus[0] = downloadUrl!;
		if (currH.includes('720p'))
			dlStatus[1] = downloadUrl!;
		if (currH.includes('1080p'))
			dlStatus[2] = downloadUrl!;
	})

	// Returns the array of download URLs.
	return dlStatus

};


/**
 * Retrieves download URLs for a given movie based on the provided query.
 *
 * This function performs the following steps:
 * 1. Fetches `HTML content` for the movie `search` results page.
 * 2. Extracts the `URL` of the movie `details page`.
 * 3. Retrieves download URLs for different `resolutions` `(480p, 720p, 1080p)` from the details page.
 *
 * @async
 * @function
 *
 * @param {MovieDLScrapQuery} query - The query containing movie `title`, `language`, and `year`.
 *
 * @throws {Error} Will throw an error if any step of the process fails.
 *
 * @returns {Promise<DownloadUrlTuple | void>} - An array containing download URLs for resolutions `['480p', '720p', '1080p']`, or `void` if an error occurs.
 */

export const movieDLScraping = async (query: MovieDLScrapQuery):Promise<DownloadUrlTuple | void> => {
	try {
		// Step 1: Fetch HTML content for the movie search results page.
		const html = await fetchMovieHtml(`/?s=${query.title.toLowerCase()}`);

		// Step 2: Extract the URL of the movie details page.
		const pageUrl = getPageUrl(html as string, query);

		// when movie not in search result
		if(!pageUrl) return ['','',''];

		// Step 3: Retrieve download URLs for different resolutions (480p, 720p, 1080p) from the details page.
		const linkArr = getDownloadUrl(await (await fetch(pageUrl)).text());

		return linkArr;

	} catch (err: any) {
		logError(err);
	}
};