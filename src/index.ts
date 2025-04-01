import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import noticesTable from './db/noticesTable';
import { Scraper, ShortNotice } from './services/scraper';
import { checkUpdates, genCompleteNotice, UpdateHandleError, UpdateHandler } from './updateHandle';

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

export type NoticeMap<T> = Record<number, T[]>;

export interface Link {
	label: string;
	url: string;
}

export interface File {
	label: string;
	src: string;
}

export type WithId<T> = T & { id: number };

let db: DrizzleD1Database<Record<string, never>> & { $client: D1Database };

export default {
	async scheduled(event, env, ctx) {
		let savedNotices: NoticeMap<Notice> = {};
		const scraper = new Scraper();
		const dbContext = env.DB;

		if (!db) {
			db = drizzle(dbContext);
		}

		const fetchedData = addIdsOf(await scraper.getData(10));
		let latestNotices: NoticeMap<WithId<ShortNotice>> = {};
		insertDataToMap(latestNotices, fetchedData);

		if (!Object.keys(savedNotices).length) {
			const lastNotices = (await db.select().from(noticesTable)).sort((a, b) => a.id - b.id);
			insertDataToMap(savedNotices, lastNotices);
		}

		const updates: WithId<ShortNotice>[] = checkUpdates(savedNotices, latestNotices);
		const completeUpdates: Notice[] = [];

		if (updates.length) {
			for (let update of updates) {
				completeUpdates.push(await genCompleteNotice(update));
			}

			const updateHandler = new UpdateHandler(db, env);

			let retries = 0;
			while (true) {
				try {
					await updateHandler.dispatchUpdates(completeUpdates);
					savedNotices = {};
				} catch (error: unknown) {
					if (error instanceof UpdateHandleError) {
						if (++retries <= 3) continue;
					}
				}
				break;
			}
		}
	},
} satisfies ExportedHandler<Env>;

export function insertDataToMap(list: NoticeMap<WithId<ShortNotice>>, data: WithId<ShortNotice>[]): void {
	for (let i = 0; i < data.length; i++) {
		const key = getKey(data[i].id);
		let field = list[key];
		field ? list[key].push(data[i]) : (list[key] = [data[i]]);
	}
}

export function getKey(id: number) {
	return parseInt(`${id}`.substring(0, 8));
}

export function addIdsOf(shortNotice: ShortNotice[]): WithId<ShortNotice>[] {
	let lastCreatedId: string = '0';
	let count: number = 0;
	const finalList: WithId<ShortNotice>[] = [];

	for (let i = shortNotice.length - 1; i >= 0; i--) {
		const splits = shortNotice[i].date.split('-').map((item, index) => {
			if (index > 0) {
				if (item.length !== 2) return '0' + item;
			}
			return item;
		});

		let id = splits.join('');

		if (lastCreatedId !== '0' && id === lastCreatedId) {
			count++;
		} else {
			count = 0;
		}

		lastCreatedId = id;

		finalList.push({
			id: parseInt(id + count),
			...shortNotice[i],
		});
	}

	return finalList;
}
