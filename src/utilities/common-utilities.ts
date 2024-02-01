import { encryption_iv, encryption_key, tmdb_api } from '@config/env-var';
import { CheckDLUrlArg, GetUrlStatus, RouteHandlerType } from '@custom-types/types';
import logger from './color-logger';
import { Response as ResponseX } from 'express';
import inDevMode from './development-mode';
import nodeFetch from 'node-fetch';
import crypto from 'crypto';

export const routeHandler = <Return = void, Req = undefined>(callback: RouteHandlerType<Return, Req>): RouteHandlerType<Return, Req> => {
	return callback;
};

// common user agent
export const userAgent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
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

// throw error if the download link is not active or redirect 301 or 302 status found
export const checkDLUrl = (arg:CheckDLUrlArg): boolean => {
	if (arg.status === 200 && arg.content_type === 'video/x-matroska' || arg.content_type === 'video/mp4') return true;
	return false;
};

/**
 *
 * get url `http` status
 *
 * @param url
 * @param option
 * @returns {{status:number,size:number}}
 */
export const getURLStatus = async (url:string,option?:any):Promise<GetUrlStatus> => {
	try{
		if(!option) {
			option = {
				headers:{
					'User-Agent':userAgent
				}
			};
		}
		const response = await nodeFetch(url,{
			...option,
			method:'HEAD',
		});

		return {
			status:response.status,
			size: response.headers.get('Content-Length')!,
			content_type:response.headers.get('Content-Type')!,
		};
	} catch (err:any) {
		logError(err);
		return {
			status:401,
			size:'0',
			content_type:''
		};
	}
};

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
 * Extract Temp token from driveseed
 */

export const extractDriveSeedKey = (pageStr: string) => {
	const keyRegex = /formData\.append\("key", "([^"]+)"\);/;
	const match = pageStr.match(keyRegex);
	return match ? match[1] : null;
};

/**
 * Fetches HTML content from a given URL.
 * @param {string} url - The URL to fetch the HTML content from.
 * @param {any} option - Request Header Option.
 * @returns {Promise<string>} A promise that resolves to the HTML content.
 * @throws {Error} If the fetch operation fails.
 */

export const fetchHtml = async (url: string, option?: any): Promise<any> => {
	const defaultOpt = {
		method: 'GET',
		headers: {
			'Content-Type': 'text/html',
			'User-Agent': userAgent
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

export const encryptUrl = (str:string) => {
	const key = Buffer.from(encryption_key!, 'hex');
	const iv = Buffer.from(encryption_iv!, 'hex');
	const algorithm = 'aes-256-cbc';
	const cipher = crypto.createCipheriv(algorithm, key, iv);
	let encryptedData = '';
	encryptedData += cipher.update(str, 'utf8', 'hex');
	encryptedData += cipher.final('hex');
	return encryptedData;
};