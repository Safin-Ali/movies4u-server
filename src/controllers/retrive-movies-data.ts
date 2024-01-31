import { useDb } from '@app';
import { ResPostIdTuple } from '@custom-types/types';
import { InitDB } from '@db';
import logger from '@utilities/color-logger';
import { checkDLUrl, encryptUrl, fetchTMDB, getURLStatus, logError, routeHandler, sendServerError} from '@utilities/common-utilities';
import inDevMode from '@utilities/development-mode';
import { GenerateLink, postIdDefultVal } from '@utilities/download-url-scraping';
import nodeFetch from 'node-fetch';

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
		},true);

		// store response value
		let downloadUrlArr:ResPostIdTuple = [...postIdDefultVal];

		// to call GenerateLink class and update tempLink in db
		const callGL = async (postId?:ResPostIdTuple) => {
			const res = await new GenerateLink({
				title,
				year,
				postId
			}).getUrl();
			downloadUrlArr = res;

			InitDB.updateTempLink(res,dbFilter);
		};

		/**
		 * if own databse not have any info about current movie then it will be try generate download link and update and insert current movie all info
		 * else set retrieved download url
		 */
		if(!info) {
			await callGL();
		} else {
			// check link is active or not
			const linkStatus = checkDLUrl(await getURLStatus(info.tempLink[0]));

			// scrap again if link is not valid and save and return update link
			if(!linkStatus) {
				inDevMode(() => logger.warn('links are not valid'));
				// check driveSeed path link active or not
				const driveSeedPathSts = checkDLUrl(await getURLStatus(info.driveSeedUrl[0]));
				if(driveSeedPathSts) {

					// get new actived link promises array
					const newActLink: ResPostIdTuple= await Promise.all((info.driveSeedUrl as any[]).map(async (dsPath) => {
						const res = await GenerateLink.getDirectLinkDRC(dsPath);
						return res;
					})) as ResPostIdTuple;
					console.log(newActLink);
					InitDB.updateTempLink(newActLink,dbFilter);
					downloadUrlArr = newActLink as ResPostIdTuple;

				} else {
					await callGL(info.postId);
				}
			}

			// if link already active then update to downloadUrl
			downloadUrlArr = info.tempLink;

		}

		const encrypt_urls = downloadUrlArr.map(url => {
			return !url ? url : encryptUrl(url);
		})

		// Sends a successful response with movie details and download URL.

		res.status(200).send({
			movieDetails:details,
			downloadUrl:encryptUrl
		});
	} catch (err:any) {
		logError(err);
		sendServerError(res);
	}

});