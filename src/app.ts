/**
 * @module app
 */

import { port } from '@config/env-var';
import initMiddleware from '@middleware';
import Routes from '@routes/routes';

import express, { Application} from 'express';
import logger from '@utilities/color-logger';
import inDevMode from '@utilities/development-mode';
import { InitDB } from 'database/db';
import { UseDBArg } from '@custom-types/types';

/**
 * Represents the main application class.
 * @class
 */
class App {
	/**
	 * The Express.js application instance.
	 * @private
	 * @type {Express}
	 */
	private express: typeof express = express;

	/**
	 * The Express.js application instance.
	 * @type {Application}
	 */
	public expressApp: Application;

	/**
	 * method for use db instance
	 */
	public useDb: (cb:UseDBArg) => Promise<any>;

	/**
	 * The Routes instance for managing routes.
	 * @type {Routes}
	 */
	private routes: Routes;

	/**
	 * Creates an instance of App.
	 * Initializes the Express.js application, middleware, routes, and database.
	 * @constructor
	 */
	constructor() {
		this.expressApp = this.express();
		this.useDb = new InitDB().useDb;
		initMiddleware(this.expressApp);
		this.routes = new Routes(this.expressApp);
	}

	/**
	 * Starts the server and listens on the specified port.
	 * @public
	 */
	startServer = () => {
		this.expressApp.listen(port, () => {
			inDevMode(() => logger.process(`The server is running on ${port}`));
		});
	};
}

/**
 * The main application instance.
 * @type {App}
 */
const app: App = new App();

export const {startServer,expressApp,useDb} = app;

export default app;
