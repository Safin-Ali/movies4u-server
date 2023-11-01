import { CustomRouter } from '@custom-types/types';

/**
 * Configures a custom router by returning it as is.
 *
 * @param {CustomRouter} router - The custom router to be configured.
 * @returns {CustomRouter} The configured custom router.
 */
export default function configRouter(router:CustomRouter):CustomRouter {
	return router;
}