import {  encryptUrl, fetchTMDB, logError, randomUserAgent, routeHandler, sendServerError } from '@utilities/common-utilities';
import { movieLinkTuple } from '@utilities/download-url-scraping';

/**
 * Retrieves a list of movies from The Movie Database (TMDB) based on a query.
 * @returns {Promise<void>} - A promise that resolves once the list of movies is sent in the response.
 */
export const getMovies = routeHandler(async (req, res) => {
	try {
		const moviesList = await fetchTMDB(req.query.q as string);
		res.status(200).send(moviesList);
	} catch (err: any) {
		logError(err);
		sendServerError(res);
	}

});

/**
 * Handler for getting movie details info by movie ID and released date.
 *
 * @example `movie/550988`
 * @function
 * @async
 * @returns {Promise<any>} - Resolves when the response is sent.
 * @throws {Error} - Throws an error if there is an issue with fetching data or processing the request.
 */
export const getMovieById = routeHandler(async (req, res) => {

	try {
		// Fetches details of a movie from TMDB.
		const details = await fetchTMDB(req.query.q as string);

		res.status(200).send(details);
	} catch (err: any) {
		logError(err);
		sendServerError(res);
	}

});


/**
 * handle for making url for streaming
 * @example `?q=787781&y=2023-09-09`
 * @function
 * @async
 * @returns {Promise<FinalResponseTuple>} - Resolves when the response is sent.
 */

export const getTempLink = routeHandler(async (req,res) => {
	try {
		const title = (req.query.title as string).toLowerCase();

		const year = (req.query.year as string).split('-')[0];

		const downloadUrlTuple = await movieLinkTuple({
			title,
			year
		});

		const encrypt_urls = downloadUrlTuple.map(url => {
			return {
				...url,
				link:!url.link ? url.link : encryptUrl(url.link)
			};
		});

		res.send({
			temporary_links:encrypt_urls
		});
	} catch (err:any) {
		logError(err);
		sendServerError(res);
	}
});