import { awake_key, self_domain } from '@config/env-var';
import logger from '@utilities/color-logger';
import { routeHandler, userAgent } from '@utilities/common-utilities';
import inDevMode from '@utilities/development-mode';
import nodeFetch from 'node-fetch';

export const rootRouteHandler = routeHandler((_req,res) =>{
	// awake app instance after 13 minutes later
	if(_req.headers['awake-key'] === awake_key!) {
		setTimeout(() => {
			nodeFetch(self_domain!,{
				method:'HEAD',
				headers:{
					'User-Agent':userAgent,
					'awake-key':awake_key!
				}
			})
			inDevMode(() => {
				logger.process('Awaked');
			})
		},780*1000)
		res.send('Awaked')
	} else {
		res.send('Welcome MOVIES4U SERVER');
	}
});