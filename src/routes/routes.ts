import { CustomRouter } from '@custom-types/types';
import { Application } from 'express';
import common_router from './common-router';
import moviesApiRouter from './movies-api-router';

/**
 * Represents a class for managing and registering routes in an Express application.
 */
class Routes {
	/**
	 * The Express application instance to which routes will be added.
	 */
	public app: Application;

	/**
	 * An array containing custom router configurations to be added to the Express application.
	 * You should populate this array with your exported routers.
	 */
	public routesPath: CustomRouter[] = [
		moviesApiRouter
	];

	/**
	 * Creates a new instance of the Routes class.
	 *
	 * @param {Application} app - The Express application instance to which routes will be added.
	 */
	constructor(app: Application) {
		this.app = app;

		// For common routes or route middleware, like route.all()
		this.routesPath.push(common_router);

		this.initRoutes();
	}

	/**
	 * Initializes and adds the registered routes to the Express application.
	 */
	private initRoutes() {
		this.routesPath.map(rt => this.app.use(rt[0], rt[1]));
	}
}

export default Routes;
