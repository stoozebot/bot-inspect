import scaper from './services/scaper';

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

export default {
	async scheduled(event, env, ctx) {
		const latestNoticeList = await scaper.getData(10);
		console.log(latestNoticeList);
	},
} satisfies ExportedHandler<Env>;
