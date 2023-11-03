import { fetchTMDB, logError, routeHandler, sendServerError } from '@utilities/common-utilities';

/**
 * Retrieves a list of movies from The Movie Database (TMDB) based on a query.
 * @returns {Promise<void>} - A promise that resolves once the list of movies is sent in the response.
 */
export const getMovies = routeHandler(async (req, res) => {
	try {
		const moviesList = fetchTMDB(req.query.q as string);
		res.status(200).send(moviesList);
	} catch (err:any) {
		logError(err);
		sendServerError(res);
	}

});
