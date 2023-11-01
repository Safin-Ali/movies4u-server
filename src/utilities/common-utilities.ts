import { apiBaseUrl } from '@config/env-var';
import { RouteHandlerType } from '@custom-types/types';
import logger from './color-logger';
import {Response} from 'express';


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

export function sendServerError(res:Response ,statusCode: number = 500, errorMessage:string = `Internal Server Error`): void {
    res.status(statusCode).json({ errorMessage:  errorMessage});
}

/**
 * this function provide html content for generate particuler movie download link
 * Fetches movies based on the provided option type.
 * @param {string} optType - The type of option to be used for fetching movies.
 * @returns {Promise<Response>} - A promise that resolves to the HTTP response from the server.
 * @throws {Error} - If there is an error during the fetch request.
 */
export const fetchMovieHtml = async (optType:string = ''): Promise<string | Error> => {
	try {
		const fetchRes = fetch(apiBaseUrl+optType)
		const result = await (await fetchRes).text();
		return result
	} catch (err:any) {
		logger.error(err.message)
		throw Error()
	}
};

