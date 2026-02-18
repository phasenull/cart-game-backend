import { OpenAPIHono, z } from "@hono/zod-openapi"
import { Hono } from "hono"
import { get_player_route } from "./routes/get-player"
import { eq, sql, desc, gt, count } from "drizzle-orm"
import { IPlayerSchema, type Database } from "../../utils"
import { playersTable } from "../../schema"
import { createSelectSchema } from "drizzle-orm/zod"
import { update_player_route } from "./routes/update-player"
import { list_route } from "./routes/list"

type Bindings = {
	DB: any
}

type Variables = {
	db: Database
}

export const LeaderboardController = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

LeaderboardController.openapi(get_player_route, async (c) => {
	const db = c.get("db")
	const { user_id } = c.req.valid("query")
	if (!user_id) {
		return c.json({ error: "Missing user_id query parameter" }, 400)
	}
	const [player_data] = await db
		.select()
		.from(playersTable)
		.where(eq(playersTable.user_id, user_id))
	if (!player_data) {
		return c.json({ error: "Player not found" }, 400)
	}
	
	// Calculate ranks for each leaderboard
	const [cashRankResult, playtimeRankResult, robuxSpentRankResult] = await Promise.all([
		db.select({ count: count() }).from(playersTable).where(gt(playersTable.cash, player_data.cash)),
		db.select({ count: count() }).from(playersTable).where(gt(playersTable.playtime, player_data.playtime)),
		db.select({ count: count() }).from(playersTable).where(gt(playersTable.robux_spent, player_data.robux_spent))
	])
	
	const ranks = {
		cash: (cashRankResult[0]?.count || 0) + 1,
		playtime: (playtimeRankResult[0]?.count || 0) + 1,
		robux_spent: (robuxSpentRankResult[0]?.count || 0) + 1
	}
	
	return c.json({ player: player_data, ranks }, 200)
})
LeaderboardController.openapi(update_player_route, async (c) => {
	const db = c.get("db")
	const body = await c.req.json()
	const { user_id, cash, playtime, robux_spent } = body
	if (!user_id) {
		return c.json({ error: "Missing user_id in request body" }, 400)
	}
	const [player_data] = await db.insert(playersTable).values({
		user_id,
		cash: cash || 0,
		playtime: playtime || 0,
		robux_spent: robux_spent || 0
	}).onConflictDoUpdate({
		target: playersTable.user_id,
		set: {
			cash: sql`${playersTable.cash} + ${cash || 0}`,
			playtime: sql`${playersTable.playtime} + ${playtime || 0}`,
			robux_spent: sql`${playersTable.robux_spent} + ${robux_spent || 0}`,
			updated_at: sql`CURRENT_TIMESTAMP`
		}
	}).returning()
	return c.json({ success: true }, 200)
})

LeaderboardController.openapi(list_route, async (c) => {
	const db = c.get("db")
	const [cashLeaderboard, playtimeLeaderboard, robuxSpentLeaderboard] = await Promise.all([
		db.select({ user_id: playersTable.user_id, cash: playersTable.cash }).from(playersTable).orderBy(desc(playersTable.cash)).limit(100),
		db.select({ user_id: playersTable.user_id, playtime: playersTable.playtime }).from(playersTable).orderBy(desc(playersTable.playtime)).limit(100),
		db.select({ user_id: playersTable.user_id, robux_spent: playersTable.robux_spent }).from(playersTable).orderBy(desc(playersTable.robux_spent)).limit(100)
	])

	return c.json({
		cash: cashLeaderboard,
		playtime: playtimeLeaderboard,
		robux_spent: robuxSpentLeaderboard
	}, 200)
})
