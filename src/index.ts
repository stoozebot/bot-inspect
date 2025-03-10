import scaper, { ShortNotice } from './services/scaper';
import LinkedList from './utils/LinkedList';

export interface Notice {
	id: number;
	url: string;
	title: string;
	date: string;
	files: File[];
	links: Link[];
	is_external: boolean;
	created_at: Date;
}

export interface Link {
	label: string;
	url: string;
}

export interface File {
	label: string;
	src: string;
}

export type WithId<T> = T & { id: number };

let cachedList: WithId<ShortNotice>[] = [
	// {
	// 	id: 202502190,
	// 	date: '2025-02-19',
	// 	url: 'https://www.soa.ac.in/iter-news-and-events/2025/2/22/notice-and-schedule-for-end-semester-examination-of-non-promotional-and-late-promoted-students',
	// 	title: 'Notice and Schedule for End Semester Examination of Non Promotional and Late Promoted Students',
	// },
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

let savedNoticeList = new LinkedList<WithId<ShortNotice>>();

export default {
	async scheduled(event, env, ctx) {
		const fetchedList = await scaper.getData(10);
		const fetchedListWithId = addIdsOf(fetchedList);
		let latestNoticeList = new LinkedList<WithId<ShortNotice>>();

		insertDataToLList(latestNoticeList, fetchedListWithId);

		if (savedNoticeList.isEmpty()) {
			insertDataToLList(savedNoticeList, cachedList);
		}

		const updates: WithId<ShortNotice>[] = checkUpdates(savedNoticeList, latestNoticeList);

		console.log(`Updates: ${updates.length}`);
	},
} satisfies ExportedHandler<Env>;

export function insertDataToLList(list: LinkedList<WithId<ShortNotice>>, data: WithId<ShortNotice>[]) {
	for (let i = data.length - 1; i >= 0; i--) {
		list.insert(data[i]);
	}
}

export function addIdsOf(shortNotice: ShortNotice[]): WithId<ShortNotice>[] {
	let cacheId: string = '0';
	let count: number = 0;
	const finalList: WithId<ShortNotice>[] = [];

	for (let i = 0; i < shortNotice.length; i++) {
		let id = shortNotice[i].date.split('-').join('');

		if (cacheId !== '0' && id === cacheId) {
			count++;
		} else {
			count = 0;
		}

		cacheId = id;

		finalList.push({
			id: parseInt(id + count),
			...shortNotice[i],
		});
	}

	return finalList;
}

export function checkEq<T>(ob1: T, ob2: T, ...fields: String[]): boolean {
	for (let field of fields) {
		if (ob1[field as keyof T] !== ob2[field as keyof T]) return false;
	}

	return true;
}

export function checkUpdates(savedNoticeList: LinkedList<WithId<ShortNotice>>, latestNoticeList: LinkedList<WithId<ShortNotice>>) {
	const updates: WithId<ShortNotice>[] = [];

	for (let i = 0; i < savedNoticeList.length(); i++) {
		for (let j = 0; j < latestNoticeList.length(); j++) {
			let savedItem = savedNoticeList.peekNode(i);
			let latestItem = latestNoticeList.peekNode(j);

			if (!savedItem?.data || !latestItem?.data) {
				break;
			}

			if (!latestItem.isConnected())
				if (checkEq<WithId<ShortNotice>>(savedItem.data, latestItem.data, 'url', 'title')) {
					savedItem.connect(latestItem);
				}
		}
	}

	for (let i = 0; i < latestNoticeList.length(); i++) {
		const item = latestNoticeList.peekNode(i);
		if (!item) break;

		if (!item.isConnected()) {
			updates.push(item.data);
		}
	}

	return updates;
}
