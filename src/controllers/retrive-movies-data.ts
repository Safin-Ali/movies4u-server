import {  encryptUrl, fetchTMDB, logError, routeHandler, sendServerError } from '@utilities/common-utilities';
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
 * @example `?q=787781&y=2023-09-09`
 * @function
 * @async
 * @returns {Promise<void>} - Resolves when the response is sent.
 * @throws {Error} - Throws an error if there is an issue with fetching data or processing the request.
 */
export const getMovieById = routeHandler(async (req, res) => {

	try {
		// Fetches details of a movie from TMDB.
		const details = await fetchTMDB(req.query.q as string);

		const title = details.original_title.toLowerCase();

		// Extracts the year from the provided movie release date.
		const year = (req.query.y as string).split('-')[0];

		const downloadUrlTuple = await movieLinkTuple({title,year});

		const encrypt_urls = downloadUrlTuple.map(url => {
			return {
				...url,
				link:!url.link ? url.link : encryptUrl(url.link)
			};
		});

		// Sends a successful response with movie details and download URL.

		res.status(200).send({
			movieDetails: details,
			downloadUrl: encrypt_urls
		});
	} catch (err: any) {
		logError(err);
		sendServerError(res);
	}

});