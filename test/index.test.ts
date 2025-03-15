import { beforeAll, describe, expect, it } from 'vitest';
import { addIdsOf, getKey, insertDataToMap, NoticeMap, WithId } from '../src/index';
import { ShortNotice } from '../src/services/scraper';

describe('Main', { sequential: true }, () => {
	let fetchedList: ShortNotice[] = [];
	let cachedList: WithId<ShortNotice>[] = [];
	let map2: NoticeMap<WithId<ShortNotice>> = {};

	beforeAll(() => {
		cachedList = [
			{
				id: 202502190,
				date: '2025-02-19',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/2/22/notice-and-schedule-for-end-semester-examination-of-non-promotional-and-late-promoted-students',
				title: 'Notice and Schedule for End Semester Examination of Non Promotional and Late Promoted Students',
			},
			{
				id: 202501270,
				date: '2025-01-27',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/1/29/programme-for-end-semester-examination-for-1st-semester-students',
				title: 'Programme for End-Semester Examination for 1st Semester Students',
			},
			{
				id: 202501200,
				date: '2025-01-20',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/1/21/notice-and-schedule-for-the-mid-semester-examination-of-non-promotional-and-late-promoted-students',
				title: 'Notice and Schedule for the Mid Semester Examination of Non-Promotional and Late Promoted Students',
			},
			{
				id: 202501091,
				date: '2025-01-09',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/1/9/notice-regarding-commencement-of-2nd-semester-classes',
				title: 'Notice regarding commencement of 2nd Semester Classes',
			},
			{
				id: 202501090,
				date: '2025-01-09',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/1/9/bwxeavb71nt2i7g4odd7tmu2jv7sub',
				title: 'Notice regarding End Semester Examination for 1st Semester Students',
			},
			{
				id: 202501070,
				date: '2025-01-07',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/1/7/notice-regarding-shifting-of-examination',
				title: 'Notice regarding shifting of examination',
			},
			{
				id: 202501040,
				date: '2025-01-04',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/1/4/notice-regarding-class-suspension',
				title: 'Notice regarding class suspension',
			},
			{
				id: 202501011,
				date: '2025-01-01',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/1/3/schedule-for-3rd-semester-end-semester-examination',
				title: 'Schedule for 3rd Semester End Semester Examination',
			},
			{
				id: 202501010,
				date: '2025-01-01',
				url: 'https://www.soa.ac.in/iter-news-and-events/2025/1/3/schedule-for-5th-semester-end-semester-examination',
				title: 'Schedule for 5th Semester End Semester Examination',
			},
			{
				id: 202412280,
				date: '2024-12-28',
				url: 'https://www.soa.ac.in/iter-news-and-events/2024/12/29/notice-regarding-scholarship',
				title: 'Notice regarding Scholarship',
			},
		];
		fetchedList = cachedList.map((item) => {
			const newItem: ShortNotice & { id?: number } = JSON.parse(JSON.stringify(item));
			delete newItem.id;
			return newItem;
		});
	});

	it('inserts data to a Map.', () => {
		expect(Object.keys(map2).length).toBe(0);
		insertDataToMap(map2, cachedList);
		expect(map2[getKey(cachedList[0].id)][0]).toEqual(cachedList[0]);
	});

	it('adds ids to fetched data.', () => {
		expect(fetchedList[0]).not.toMatchObject({ id: 202502190 });
		fetchedList = addIdsOf(fetchedList);
		expect(fetchedList[0]).toMatchObject({ id: 202502190 });
	});

	it('gets the key of a notice map.', () => {
		expect(getKey(202403280)).toBe(20240328);
	});
});
