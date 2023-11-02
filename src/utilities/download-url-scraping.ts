import { MovieDLScrapQuery } from '@custom-types/types';
import { load } from 'cheerio';


/**
 *
 * search movies by title and lang and return matched movie visit or single page `url`
 *
 * @param {string} html - html as a string for `manipulate`.
 * @param {MovieDLScrapQuery} query - for matching movie `title` and `language`.
 * @returns {string} string of `movie details pageUrl`.
 */

export const getPageUrl = (html: string, { lang, title, year}: MovieDLScrapQuery): string => {

	// load html for create cheerio instance
	const $ = load(html);

	// remove all script and style elements
	$('body style, body script').remove();

	// Get the element of all collected matches movies name
	const matchesMovies = $('body #content_box .post-cards article.latestPost h2.title.front-view-title a');

	// visit page url
	let pageUrl: string = '';

	// if no one movies found then send empty string
	if (!matchesMovies.length) return pageUrl;

	matchesMovies.each((_, elm) => {
		// movie page path
		const visitUrl = elm.attribs.href;

		// movie title
		const scrapedTitle = $(elm).text().toLowerCase();

		if (scrapedTitle.includes(`download ${title.toLowerCase()}`) && scrapedTitle.includes(lang.toLowerCase()) && scrapedTitle.includes(year))
			pageUrl = visitUrl;
	});

	return pageUrl;
};