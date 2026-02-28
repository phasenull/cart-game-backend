import { OpenAPIHono } from "@hono/zod-openapi"
import { type Database } from "../../utils"
import { sessionTable } from "../../schema"
import { leave_session_route } from "./routes/leave-session"
import { list_sessions_route } from "./routes/list-sessions"
import { eq, count, desc } from "drizzle-orm"

type Bindings = { DB: any }
type Variables = { db: Database }

export const SessionController = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

SessionController.openapi(leave_session_route, async (c) => {
	const db = c.get("db")
	const body = c.req.valid("json")

	const [row] = await db
		.insert(sessionTable)
		.values(body)
		.returning()

	if (!row) {
		return c.json({ error: "Failed to save session" }, 400)
	}

	return c.json({ success: true, session: row }, 200)
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
