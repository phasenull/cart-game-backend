import { index, int, sqliteTable,text } from "drizzle-orm/sqlite-core";

const TABLE_UTILS = {
	created_at: int({mode:"timestamp_ms"}).notNull().defaultNow(),
	updated_at: int({mode:"timestamp_ms"})
}
export const feedbackTable = sqliteTable("feedback", {
	id: int().primaryKey({ autoIncrement: true }),
	user_id: int().notNull(),
	description: text().notNull(),
	status: text({ enum: ["pending", "rejected", "approved"] }).notNull().default("pending"),
	response: text(),
	responded_at: int({ mode: "timestamp_ms" }),
	deleted_at: int({ mode: "timestamp_ms" }),
	created_at: int({ mode: "timestamp_ms" }).notNull().defaultNow(),
}, (table) => [
	index("idx_feedback_user_id").on(table.user_id),
	index("idx_feedback_status").on(table.status),
	index("idx_feedback_created_at").on(table.created_at),
])
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
