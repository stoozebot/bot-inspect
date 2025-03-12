import * as cheerio from 'cheerio';
import { Link, Notice } from '..';

export type ShortNotice = Omit<Notice, 'id' | 'files' | 'links' | 'is_external' | 'created_at'>;
export type LinksNotice = Pick<Notice, 'is_external' | 'links'>;

export class Scaper {
	private static url: URL = new URL('https://www.soa.ac.in/iter');
	protected $: cheerio.CheerioAPI | null = null;

	constructor() {}

	public isLoaded() {
		return this.$ !== null;
	}

	async load() {
		const res = await fetch(Scaper.url, { method: 'GET', headers: { 'User-Agent': 'Chrome/110.0.0.0' } });
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
					url: `${Scaper.url.origin}${el('div.summary-title a').prop('href')}`,
					title: el('div.summary-title a').text(),
				};
				data[i] = datum;
			}

			return data;
		}
	}

	async getNoticeData(noticeData: ShortNotice): Promise<LinksNotice> {
		const res = await fetch(noticeData.url, { method: 'GET', headers: { 'User-Agent': 'Chrome/110.0.0.0' } });
		const html = await res.text();
		let links: Link[] = [];

		const $ = cheerio.load(html);
		const targetElements = $('[data-layout-label="Post Body"] div.row div.col > div.sqs-block');

		const isExternal = !(targetElements.hasClass('html-block') || targetElements.hasClass('image-block'));

		if (isExternal) {
			targetElements.map((i, el) => {
				const $ = cheerio.load(el);
				const btn = $('a.sqs-block-button-element');
				links.push({
					label: btn.text().trim(),
					url: btn.prop('href') || Scaper.url.href,
				});
			});
		} else {
			links.push({ label: 'view notice', url: noticeData.url });
		}

		return {
			is_external: isExternal,
			links: links,
		};
	}
}

export default new Scaper();
