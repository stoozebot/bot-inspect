import * as cheerio from 'cheerio';
import { Notice } from '..';

export type ShortNotice = Omit<Notice, 'id' | 'files' | 'links' | 'is_external' | 'created_at'>;

export class Scaper {
	url: URL = new URL('https://www.soa.ac.in/iter');
	protected $: cheerio.CheerioAPI | null = null;

	constructor() {}

	public isLoaded() {
		return this.$ !== null;
	}

	async load() {
		const res = await fetch(this.url, { method: 'GET', headers: { 'User-Agent': 'Chrome/110.0.0.0' } });
		const doc = await res.text();

		if (res.status !== 200) {
			throw new Error(`error in fetching data, statusCode: ${res.status}`);
		}

		this.$ = cheerio.load(doc);
	}

	async awaitLoad() {
		return new Promise((res, rej) => {
			this.load()
				.then((data) => {
					res(data);
				})
				.catch(() => {
					rej('failed to load data.');
				});
		});
	}

	async getData(num: number = 10): Promise<ShortNotice[]> {
		if (this.$ == null) {
			await this.awaitLoad();
			return this.getData();
		} else {
			const data: ShortNotice[] = [];

			for (let i = 0; i < num; i++) {
				const el = cheerio.load(this.$('div.summary-item-list.sqs-gallery div.summary-item').eq(i).toString());

				const datum: ShortNotice = {
					date: el('time').attr('datetime') as string,
					url: `${this.url.origin}${el('div.summary-title a').prop('href')}`,
					title: el('div.summary-title a').text(),
				};
				data[i] = datum;
			}

			return data;
		}
	}
}

export default new Scaper();
