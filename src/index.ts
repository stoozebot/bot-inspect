import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import noticesTable from './db/noticesTable';
import { Scraper, ShortNotice } from './services/scraper';
import { checkUpdates, genCompleteNotice, UpdateHandler, UpdateHandleError, checkEq } from './updateHandle';
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

let db: DrizzleD1Database<Record<string, never>> & { $client: D1Database };
let savedNoticeList = new LinkedList<WithId<ShortNotice>>();

export default {
	async scheduled(event, env, ctx) {
		const scraper = new Scraper();
		const dbContext = env.DEV !== 'false' ? env.localDB : env.DB;

		if (!db) {
			db = drizzle(dbContext);
		}

		const fetchedData = addIdsOf(await scraper.getData(10));
		let latestNoticeList = new LinkedList<WithId<ShortNotice>>();
		insertDataToLList(latestNoticeList, fetchedData);

		if (savedNoticeList.isEmpty()) {
			const lastNotices = (await db.select().from(noticesTable)).sort((a, b) => a.id - b.id);
			insertDataToLList(savedNoticeList, lastNotices);
		}

		const updates: WithId<ShortNotice>[] = checkUpdates(savedNoticeList, latestNoticeList);
		const completeUpdates: Notice[] = [];

		if (updates.length) {
			for (let update of updates) {
				for (let i = 0; i < savedNoticeList.length(); i++) {
					if (checkEq(update, savedNoticeList.peek(i), 'id')) {
						update.id++;
					}
				}
				completeUpdates.push(await genCompleteNotice(update));
			}

			const updateHandler = new UpdateHandler(db);

			let retries = 0;
			while (true) {
				try {
					await updateHandler.dispatchUpdates(completeUpdates);
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
