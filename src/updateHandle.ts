import { sql } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { Notice, NoticeMap, WithId } from '.';
import noticesTable from './db/noticesTable';
import scraper, { ShortNotice } from './services/scraper';

type Code = 'database' | 'send';
export class UpdateHandleError extends Error {
	code: Code;
	constructor(msg: string, code: Code) {
		super(msg);
		this.code = code;
	}
}

export class UpdateHandler {
	lastUpdates: Notice[] = [];
	constructor(public db: DrizzleD1Database<Record<string, never>> & { $client: D1Database }, public env: Env) {}

	async dispatchUpdates(updates: Notice[]): Promise<void> {
		try {
			await this.db.insert(noticesTable).values(updates);
		} catch (error) {
			const err = new UpdateHandleError('failed to update database', 'database');
			throw err;
		}
		this.lastUpdates = updates;

		let key: string;

		try {
			key = crypto.randomUUID() + '$' + Date.now();
			await this.env.KV.put(key, JSON.stringify(updates));
			try {
				const url = new URL(this.env.DISPATCH_URL);
				await fetch(url.origin + '/update-trigger', {
					method: 'POST',
					headers: {
						'X-API-Key': this.env.API_KEY,
					},
					body: JSON.stringify({
						key,
					}),
				});
			} catch (error) {
				await this.handleSendError(error, 'failed to send updates to dispatcher');
				await this.env.KV.delete(key);
			}
		} catch (error) {
			await this.handleSendError(error, 'failed to put updates to KV');
		}
	}

	async rollback(): Promise<void> {
		for (let notice of this.lastUpdates) {
			await this.db.delete(noticesTable).where(sql`${noticesTable.id} = ${notice.id}`);
		}
	}

	async handleSendError(error: unknown, message: string) {
		const err = new UpdateHandleError(message, 'send');
		console.error(error);
		console.log('rolling back...');
		await this.rollback();
		throw err;
	}
}

export function checkUpdates(savedNoticeMap: NoticeMap<Notice>, latestNoticeMap: NoticeMap<WithId<ShortNotice>>) {
	const updates: WithId<ShortNotice>[] = [];

	for (let key in latestNoticeMap) {
		if (!savedNoticeMap[key]) {
			latestNoticeMap[key].map((notice) => {
				updates.push(notice);
			});
		} else {
			for (let i = 0; i < latestNoticeMap[key].length; i++) {
				let found = false;

				for (let j = 0; j < savedNoticeMap[key].length; j++) {
					if (isEqual(latestNoticeMap[key][i], savedNoticeMap[key][j], 'title', 'url')) {
						found = true;
						break;
					}
				}

				if (!found) {
					checkIdEqualityAndModify(latestNoticeMap[key][i], savedNoticeMap[key]);
					updates.push(latestNoticeMap[key][i]);
				} else found = false;
			}
		}
	}

	return updates;
}

export function checkIdEqualityAndModify(notice1: WithId<ShortNotice>, notice2: Notice[]) {
	for (let i = 0; i < notice2.length; i++) {
		if (notice1.id == notice2[i].id) {
			notice1.id++;
		}
	}
}

export async function genCompleteNotice(shortNotice: WithId<ShortNotice>): Promise<Notice> {
	const noticeData = await scraper.getNoticeData(shortNotice);
	return {
		...noticeData,
		...shortNotice,
		created_at: new Date(),
		files: [],
	} satisfies Notice;
}

export function isEqual<T>(ob1: T, ob2: T, ...fields: String[]): boolean {
	for (let field of fields) {
		if (ob1[field as keyof T] !== ob2[field as keyof T]) return false;
	}

	return true;
}
