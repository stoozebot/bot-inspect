import { describe, expect, it, vi } from 'vitest';
import index from './index.html';
import { Scaper } from '../../src/services/scaper';
import * as cheerio from 'cheerio';

describe('Scraper', { sequential: true }, async () => {
	class rScraper extends Scaper {
		constructor() {
			super();
		}

		async load() {
			this.$ = cheerio.load(index);
		}

		unLoad() {
			this.$ = null;
		}
	}

	const scraper = new rScraper();

	it('checks if it has loaded the data/notices or not and then loads the data/notices.', () => {
		scraper.unLoad();
		expect(scraper.isLoaded()).toBe(false);
		scraper.load();
		expect(scraper.isLoaded()).toBe(true);
	});

	it('gets the last specified chunk data.', async () => {
		const data = await scraper.getData(10);
		expect(data.length).toBe(10);
	});
});
