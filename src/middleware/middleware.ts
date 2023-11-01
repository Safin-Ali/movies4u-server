import { Application, } from 'express';
import {json} from 'express';
import cors from 'cors';

const initMiddleware = (app:Application) => {

	// for JSON pharser
	app.use(json());

	// for CORS
	app.use(cors());
};

export default initMiddleware;