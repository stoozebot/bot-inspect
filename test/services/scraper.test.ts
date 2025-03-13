import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';
import { WithId } from '../../src';
import { LinksNotice, Scaper, ShortNotice } from '../../src/services/scaper';
import index from './index.txt';

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
		const cachedList = [
			{
				date: '2025-02-19',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/2/22/notice-and-schedule-for-end-semester-examination-of-non-promotional-and-late-promoted-students',
				title: 'Notice and Schedule for End Semester Examination of Non Promotional and Late Promoted Students',
			},
			{
				date: '2025-01-27',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/1/29/programme-for-end-semester-examination-for-1st-semester-students',
				title: 'Programme for End-Semester Examination for 1st Semester Students',
			},
			{
				date: '2025-01-20',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/1/21/notice-and-schedule-for-the-mid-semester-examination-of-non-promotional-and-late-promoted-students',
				title: 'Notice and Schedule for the Mid Semester Examination of Non-Promotional and Late Promoted Students',
			},
			{
				date: '2025-01-09',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/1/9/notice-regarding-commencement-of-2nd-semester-classes',
				title: 'Notice regarding commencement of 2nd Semester Classes',
			},
			{
				date: '2025-01-09',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/1/9/bwxeavb71nt2i7g4odd7tmu2jv7sub',
				title: 'Notice regarding End Semester Examination for 1st Semester Students',
			},
			{
				date: '2025-01-07',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/1/7/notice-regarding-shifting-of-examination',
				title: 'Notice regarding shifting of examination',
			},
			{
				date: '2025-01-04',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/1/4/notice-regarding-class-suspension',
				title: 'Notice regarding class suspension',
			},
			{
				date: '2025-01-01',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/1/3/schedule-for-3rd-semester-end-semester-examination',
				title: 'Schedule for 3rd Semester End Semester Examination',
			},
			{
				date: '2025-01-01',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/1/3/schedule-for-5th-semester-end-semester-examination',
				title: 'Schedule for 5th Semester End Semester Examination',
			},
			{
				date: '2024-12-28',
				url: 'https://www.soa.ac.in/iter-news-and-events/2024/12/29/notice-regarding-scholarship',
				title: 'Notice regarding Scholarship',
			},
		];
		const data = await scraper.getData(10);
		expect(data.length).toBe(10);
		expect(data).toEqual(cachedList);
	});

	it('fetches the data of a specific notice.', { todo: true }, async () => {
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
