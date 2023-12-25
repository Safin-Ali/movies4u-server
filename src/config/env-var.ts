import logger from '@utilities/color-logger';
import dotenv from 'dotenv';

// Load environment variables from a .env file
dotenv.config();

// Access environment variables
const env = process.env;

/**
 * If .env file missing in root directory then print
 * ==> Environment Variable Missing In Root Directory <==
 */

if(env.node_env === undefined && env.port === undefined) logger.warn('==> Environment Variable Missing In Root Directory <==');

/**
 * Configuration object containing MongoDB URI, port, and Node.js environment.
 *
 * @namespace
 * @property {number} port - The port on which the application will listen.
 * @property {string} node_env - The Node.js environment (e.g., 'development', 'production').
 */
export const { port, node_env,movies_db_url,tmdb_api,db_uri,dbName,verifyPageUrl} = {
	port: env.PORT || 5000,
	movies_db_url: env.MOVIES_DB_URL,
	node_env: env.NODE_ENV,
	tmdb_api: env.TMDB_API,
	db_uri:env.DB_URI,
	dbName:env.DB_NAME,
	verifyPageUrl:env.ODM_URL
};