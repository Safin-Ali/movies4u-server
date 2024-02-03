import configRouter from '@utilities/config-router';
import { router } from './common-router';
import { getMovieById, getMovies, getTempLink } from '@controllers/retrive-movies-data';

// get movies collection by different type query
router.get('/movies',getMovies);

// get movie by id
router.get('/movie',getMovieById);

// make streaming temp link
router.get('/temp_link',getTempLink);

export default configRouter(['/api',router]);