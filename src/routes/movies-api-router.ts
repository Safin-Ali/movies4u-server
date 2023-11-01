import configRouter from '@utilities/config-router';
import { router } from './common-router';
import { getMovies } from '@controllers/fetch-movies-data';

// get movies collection by different type query
router.get('/movies',getMovies);

export default configRouter(['/api',router]);