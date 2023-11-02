import { rootRouteHandler } from '@controllers/root-page';
import configRouter from '@utilities/config-router';
import {Router} from 'express';

// export Router interface function
export const router = Router();

// that will always end of all routes
router.all('/api/*',rootRouteHandler);

export default configRouter(['/',router]);