import { OpenAPIHono } from "@hono/zod-openapi"
import { type Database } from "../../utils"
import { sessionTable } from "../../schema"
import { join_session_route } from "./routes/join-session"
import { leave_session_route } from "./routes/leave-session"
import { list_sessions_route } from "./routes/list-sessions"
import { eq, count, desc } from "drizzle-orm"

type Bindings = { DB: any }
type Variables = { db: Database }

export const SessionController = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

SessionController.openapi(join_session_route, async (c) => {
	const db = c.get("db")
	const { uuid, user_id, server_version, joined_at } = c.req.valid("json")

	const [row] = await db
		.insert(sessionTable)
		.values({ uuid, user_id, server_version, joined_at })
		.returning()

	if (!row) {
		return c.json({ error: "Failed to create session" }, 400)
	}

	return c.json({ success: true, session: { uuid: row.uuid, user_id: row.user_id, server_version: row.server_version, joined_at: row.joined_at } }, 200)
})

SessionController.openapi(leave_session_route, async (c) => {
	const db = c.get("db")
	const { uuid, left_at, playtime, leave_x, leave_y, leave_z, last_collected_checkpoint } = c.req.valid("json")

	const [row] = await db
		.update(sessionTable)
		.set({ left_at, playtime, leave_x, leave_y, leave_z, last_collected_checkpoint })
		.where(eq(sessionTable.uuid, uuid))
		.returning()

	if (!row) {
		return c.json({ error: "Session not found" }, 404)
	}

	return c.json({
		success: true,
		session: {
			uuid: row.uuid,
			user_id: row.user_id,
			server_version: row.server_version,
			joined_at: row.joined_at,
			left_at: row.left_at!,
			playtime: row.playtime!,
			leave_x: row.leave_x!,
			leave_y: row.leave_y!,
			leave_z: row.leave_z!,
			last_collected_checkpoint: row.last_collected_checkpoint!,
		}
	}, 200)
})

SessionController.openapi(list_sessions_route, async (c) => {
	const db = c.get("db")
	const { user_id, limit, offset } = c.req.valid("query")

	const whereClause = user_id ? eq(sessionTable.user_id, user_id) : undefined

	let sessions, totalResult
	try {
		;[sessions, totalResult] = await Promise.all([
			db
				.select()
				.from(sessionTable)
				.where(whereClause)
				.orderBy(desc(sessionTable.joined_at))
				.limit(limit)
				.offset(offset),
			db
				.select({ count: count() })
				.from(sessionTable)
				.where(whereClause)
		])
	} catch (e) {
		return c.json({ error: String(e) }, 500)
	}

	return c.json({ sessions, total: totalResult[0]?.count ?? 0 }, 200)
})
