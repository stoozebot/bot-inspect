import { DrizzleD1Database } from 'drizzle-orm/d1';
import { Notice, WithId } from '.';
import scraper, { ShortNotice } from './services/scraper';
import LinkedList from './utils/LinkedList';
import noticesTable from './db/noticesTable';
import { sql } from 'drizzle-orm';

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
	constructor(public db: DrizzleD1Database<Record<string, never>> & { $client: D1Database }) {}

	async dispatchUpdates(updates: Notice[]): Promise<void> {
		try {
			await this.db.insert(noticesTable).values(updates);
		} catch (error) {
			const err = new UpdateHandleError('failed to update database', 'database');
			throw err;
		}
		this.lastUpdates = updates;

		try {
			// simulating send
			console.log(`added:\n ${JSON.stringify(updates)}`);
		} catch (error) {
			const err = new UpdateHandleError('failed to send updates', 'send');
			console.error('failed to send updates...');
			console.log('rolling back...');
			await this.rollback();
			throw err;
		}
	}

	async rollback(): Promise<void> {
		for (let notice of this.lastUpdates) {
			await this.db.delete(noticesTable).where(sql`${noticesTable.id} = ${notice.id}`);
		}
	}
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

export async function genCompleteNotice(shortNotice: WithId<ShortNotice>): Promise<Notice> {
	const noticeData = await scraper.getNoticeData(shortNotice);
	return {
		...noticeData,
		...shortNotice,
		created_at: new Date(),
		files: [],
	} satisfies Notice;
}

export function checkEq<T>(ob1: T, ob2: T, ...fields: String[]): boolean {
	for (let field of fields) {
		if (ob1[field as keyof T] !== ob2[field as keyof T]) return false;
	}

	return true;
}
