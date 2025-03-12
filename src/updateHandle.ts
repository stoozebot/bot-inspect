import { Notice, WithId } from '.';
import scraper, { ShortNotice } from './services/scaper';
import LinkedList from './utils/LinkedList';

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
