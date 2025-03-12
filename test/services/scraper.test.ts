import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';
import { WithId } from '../../src';
import { LinksNotice, Scaper, ShortNotice } from '../../src/services/scaper';
import index from './index.html';

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

	it('fetches the data of a specific notice.', async () => {
		const updates: WithId<ShortNotice>[] = [
			{
				id: 202502190,
				date: '2025-02-19',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/2/22/notice-and-schedule-for-end-semester-examination-of-non-promotional-and-late-promoted-students',
				title: 'Notice and Schedule for End Semester Examination of Non Promotional and Late Promoted Students',
			},
			{
				id: 202410070,
				date: '2025-07-10',
				url: 'https://www.soa.ac.in/iter-news-and-events/2024/7/19/science-still-trying-to-decipher-consciousness-vrajendrakumar-swami',
				title: 'Science still trying to decipher consciousness: Vrajendrakumar Swami',
			},
		];

		const updatesData: LinksNotice[] = [];
		for (let update of updates) {
			updatesData.push(await scraper.getNoticeData(update));
		}

		expect(updatesData.length).toBe(2);
		expect(updatesData).toEqual([
			{
				is_external: true,
				links: [{ label: 'ITER - 25 - 0616', url: 'https://soadu.box.com/s/eeo7mqnpkoy0mp1x6ps0r26vnna1fmxt' }],
			},
			{
				is_external: false,
				links: [
					{
						label: 'view notice',
						url: 'https://www.soa.ac.in/iter-news-and-events/2024/7/19/science-still-trying-to-decipher-consciousness-vrajendrakumar-swami',
					},
				],
			},
		]);
	});
});
