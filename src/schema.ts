import { index, int, sqliteTable,text } from "drizzle-orm/sqlite-core";

const TABLE_UTILS = {
	created_at: int({mode:"timestamp_ms"}).notNull().defaultNow(),
	updated_at: int({mode:"timestamp_ms"})
}
export const playersTable = sqliteTable("players",{
	user_id: int().primaryKey().unique().notNull(),
	...TABLE_UTILS,
	cash: int().notNull(),
	playtime: int().notNull(),
	robux_spent: int().notNull(),
},(table) => [
	index("idx_players_user_id").on(table.user_id),
	index("idx_players_created_at").on(table.created_at),
	index("idx_players_updated_at").on(table.updated_at),
	index("idx_players_cash").on(table.cash),
	index("idx_players_playtime").on(table.playtime),
	index("idx_players_robux_spent").on(table.robux_spent),
])
