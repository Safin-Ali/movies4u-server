import configRouter from '@utilities/config-router';
import { router } from './common-router';
import { getMovieById, getMovies } from '@controllers/retrive-movies-data';

// get movies collection by different type query
router.get('/movies',getMovies);

// get movie by id
router.get('/movie',getMovieById);

export default configRouter(['/api',router]);