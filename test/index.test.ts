import { beforeAll, describe, expect, it } from 'vitest';
import { addIdsOf, insertDataToLList, WithId } from '../src/index';
import { ShortNotice } from '../src/services/scraper';
import LinkedList from '../src/utils/LinkedList';
import { checkEq, checkUpdates } from '../src/updateHandle';

function numSheeps(nums: number[]): number {
	let counts: any = {};
	let count: number = 0;

	for (let i = 0; i < nums.length; i++) {
		counts[`${i}`] = 0;
	}

	for (let i = 0; i < nums.length; i++) {
		counts[`${nums[i]}`]++;
	}

	for (let i in counts) {
		if (counts[i] != 0) count++;
	}

	return count;
}

describe('Main', { sequential: true }, () => {
	let fetchedList: ShortNotice[] = [];
	let cachedList: WithId<ShortNotice>[] = [];
	let list1 = new LinkedList<WithId<ShortNotice>>();
	let list2 = new LinkedList<WithId<ShortNotice>>();

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
		fetchedList = cachedList.map<ShortNotice>((item) => {
			const newItem: ShortNotice & { id?: number } = JSON.parse(JSON.stringify(item));
			delete newItem.id;
			return newItem;
		});
	});

	it('inserts data to a linked list.', () => {
		expect(list1.isEmpty()).toBe(true);

		insertDataToLList(list1, fetchedList as any);
		insertDataToLList(list2, cachedList);

		expect(list1.isEmpty()).toBe(false);
		expect(list1.getTail()).toEqual(fetchedList[0]);
		expect(list2.getTail()).toEqual(cachedList[0]);
	});

	it('adds ids to fetched data.', () => {
		expect(fetchedList[0]).not.toMatchObject({ id: 202502190 });
		fetchedList = addIdsOf(fetchedList);
		expect(fetchedList[0]).toMatchObject({ id: 202502190 });
	});

	it('check equality of two objects.', () => {
		const obj1 = {
			name: 'Josh Amedani',
			age: 10,
		};

		const obj2 = {
			name: 'Harsh Jain',
			age: 15,
		};

		const obj3 = {
			name: 'Harsh Jain',
			age: 15,
		};

		expect(checkEq(obj1, obj2, 'name', 'age')).toBe(false);
		expect(checkEq(obj2, obj3, 'name', 'age')).toBe(true);
	});

	it('checks how many different numbers are there in an array.', () => {
		expect(numSheeps([1, 2, 3, 4])).toBe(4);
		expect(numSheeps([1, 1, 3, 1])).toBe(2);
		expect(numSheeps([1, 3, 1, 4])).toBe(3);
		expect(numSheeps([1, 1, 3, 1])).toBe(2);
		expect(numSheeps([1, 1, 1, 1])).toBe(1);
	});

	it('checks updates.', () => {
		for (let i = 0; i < cachedList.length; i++) {
			for (let j = 0; j < cachedList.length; j++) {
				for (let k = 0; k < cachedList.length; k++) {
					for (let l = 0; l < cachedList.length; l++) {
						const savedList = cachedList.filter((list, index) => index !== i && index !== j && index !== k && index !== l);
						list1.deleteAll();
						list2.disconnectAll();

						insertDataToLList(list1, savedList);

						expect(checkUpdates(list1, list2).length).toBe(numSheeps([i, j, k, l]));
					}
				}
			}
		}
	});
});
