import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { Link, File } from '..';

export default sqliteTable('notices', {
	id: integer().unique().primaryKey(),
	title: text().notNull(),
	url: text().notNull(),
	date: text().notNull(),
	files: text({ mode: 'json' }).$type<File[]>().notNull().default([]),
	links: text({ mode: 'json' }).$type<Link[]>().notNull().default([]),
	is_external: integer({ mode: 'boolean' }),
	created_at: integer({ mode: 'timestamp_ms' })
		.notNull()
		.$default(() => new Date()),
});
