import { useDb } from '@app';
import { ResPostIdTuple } from '@custom-types/types';
import { fetchTMDB, logError, routeHandler, sendServerError } from '@utilities/common-utilities';
import { GenerateLink, postIdDefultVal } from '@utilities/download-url-scraping';

/**
 * Retrieves a list of movies from The Movie Database (TMDB) based on a query.
 * @returns {Promise<void>} - A promise that resolves once the list of movies is sent in the response.
 */
export const getMovies = routeHandler(async (req, res) => {
	try {
		const moviesList = await fetchTMDB(req.query.q as string);
		res.status(200).send(moviesList);
	} catch (err:any) {
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
export const getMovieById = routeHandler(async (req,res) => {

	try{
		// Fetches details of a movie from TMDB.
		const details = await fetchTMDB(req.query.q as string);

		const title = details.original_title.toLowerCase();

		// Extracts the year from the provided movie release date.
		const year = (req.query.y as string).split('-')[0];

		// query filter for mongodb
		const dbFilter = {
			title,
			year
		};

		// database response value
		const info = await useDb(async (collection) => {
			const val = await collection.findOne(dbFilter);
			return val;
		});

		// store response value
		let downloadUrlArr:ResPostIdTuple = [...postIdDefultVal];

		// to call GenerateLink class
		const callGL = async (postId?:ResPostIdTuple) => {
			const res = await new GenerateLink({
				title,
				year,
				postId
			}).getUrl();
			downloadUrlArr = res;
			await useDb(async(cl) => {
				await cl.updateOne(dbFilter,{
					'$set':{
						'tempLink':res
					}
				});
			});
		};

		/**
		 * if own databse not have any info about current movie then it will be try generate download link and update and insert current movie all info
		 * else set retrieved download url
		 */
		if(!info) {
			await callGL();
		}
		else if (info.postId.length === 3) {
			await callGL(info.postId);
		} else {
			downloadUrlArr = info.driveSeedUrl;
		}

		// Sends a successful response with movie details and download URL.

		res.status(200).send({
			movieDetails:details,
			downloadUrl:downloadUrlArr
		});
	} catch (err:any) {
		logError(err);
		sendServerError(res);
	}

});