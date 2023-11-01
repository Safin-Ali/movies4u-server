import { routeHandler } from '@utilities/common-utilities';

export const rootRouteHandler = routeHandler((_req,res) =>{
	res.send(`<h1>this is root page </h1>`);
});