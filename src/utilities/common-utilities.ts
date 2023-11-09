import { tmdb_api } from '@config/env-var';
import { RouteHandlerType } from '@custom-types/types';
import logger from './color-logger';
import { Response as ResponseX } from 'express';
import inDevMode from './development-mode';
import nodeFetch from 'node-fetch';

/**
 * Creates a route handler function.
 * @param {RouteHandlerType} callback - The callback function that handles the route.
 *
 * @description
 * `Note 1:` This define default return and req type is `void` and `Request` ⇦⇦ express.
 *
 * `Note 2`: `callback` function accept two `Arguments`. first will be `Request` Object and second is `Response` object.
 *
 * `Note 3`: If you want to use `custom type` then use `generic` type with first `Argument` is `return` type of callback and second will be `request` type.
 *
 * @returns {RouteHandlerType} - The route handler function.
 * @example
 * // Define a handler function
 *	const myHandler = (req, res) => {
 *		const queryVal = req.params;
 *		res.send('Hello, World!',queryVal);
 * };
 *
 * // creating custom types alias
 *
 * type CustomReturnType = Promised<void>
 *
 * //for CustomReqType you need to import Request type from express.
 *
 * type CustomReqType = Request & {
 * body: {name:string ...etc},
 * query: {search:string ...etc},
 * }
 *
 * // Define a handler function with custom type
 *
 * const myHandler = <Promise<void>,CustomReqType> (req, res) => {
	const queryVal = req.params;
	res.send('Hello, World!', queryVal);
	}
 *
 * // Create a route handler using routeHandler
 * const routeHandlerFunction = routeHandler(myHandler);
 *
 * // Use routeHandlerFunction as an Express route handler
 * app.get('/my-route', routeHandlerFunction);
 */

export const routeHandler = <Return = void, Req = undefined>(callback: RouteHandlerType<Return, Req>): RouteHandlerType<Return, Req> => {
	return callback;
};

/**
 * Sends a server-side error message to the client with the specified HTTP status code.
 * @param {Response} res - The HTTP response object.
 * @param {number} statusCode - The HTTP status code to be sent to the client.
 * @param {string} errorMessage - The error message to be sent to the client.
 */

export function sendServerError(res: ResponseX, statusCode: number = 500, errorMessage: string = `Internal Server Error`): void {
	res.status(statusCode).json({ errorMessage: errorMessage });
}

/**
 * Logs an error message to the `console` in `development environment`.
 * @param {Error} err - The error message to be logged.
 * @returns {void}
 */
export const logError = (err: Error): void => inDevMode(() => {
	logger.error(err.message);
	logger.process(err.stack || '');
});

/**
 * Fetches JSON data from the specified URL.
 * @param {string} optPrefix - The `path` or `query` or `params`
 * @returns {Promise<any>} - A promise that resolves to the parsed JSON data.
 * @throws {Error} - If there is an error during the fetch request or parsing of the JSON data.
 */
export const fetchTMDB = async (optPrefix: string = ''): Promise<any> => {
	try {
		const response = await (await nodeFetch(`https://api.themoviedb.org/3/${optPrefix}`, {
			method: 'GET',
			headers: {
				accept: 'application/json',
				Authorization: `Bearer ${tmdb_api}`
			}
		})).json();
		return response;
	} catch (err: any) {
		logError(err);
		throw new Error();
	}
};

/**
 * Fetches HTML content from a given URL.
 * @param {string} url - The URL to fetch the HTML content from.
 * @param {any} option - Request Header Option.
 * @returns {Promise<string>} A promise that resolves to the HTML content.
 * @throws {Error} If the fetch operation fails.
 */
export const fetchHtml = async (url: string, option?:any): Promise<any> => {

	const defaultOpt = {
		method: 'GET',
		headers: {
			'Content-Type': 'text/html'
		},
	};
	try {
		const response = await (await nodeFetch(url, option || defaultOpt)).text();
		return response;
	} catch (err: any) {
		logError(err);
		throw new Error(`Failed to fetch: ${err.message}`);
	}
};
