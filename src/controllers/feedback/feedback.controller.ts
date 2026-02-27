import { OpenAPIHono } from "@hono/zod-openapi"
import { type Database } from "../../utils"
import { feedbackTable } from "../../schema"
import { create_feedback_route } from "./routes/create-feedback"
import { list_feedback_route } from "./routes/list-feedback"
import { eq, count, desc } from "drizzle-orm"

type Bindings = { DB: any }
type Variables = { db: Database }

export const FeedbackController = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

FeedbackController.openapi(create_feedback_route, async (c) => {
	const db = c.get("db")
	const { user_id, description } = c.req.valid("json")

	const [row] = await db
		.insert(feedbackTable)
		.values({ user_id, description })
		.returning()

	if (!row) {
		return c.json({ error: "Failed to create feedback" }, 400)
	}

	const feedback = { ...row, created_at: row.created_at instanceof Date ? row.created_at.getTime() : row.created_at }
	return c.json({ success: true, feedback }, 200)
})

FeedbackController.openapi(list_feedback_route, async (c) => {
	const db = c.get("db")
	const { status, limit, offset } = c.req.valid("query")

	const whereClause = status ? eq(feedbackTable.status, status) : undefined

	const [feedbackList, totalResult] = await Promise.all([
		db
			.select()
			.from(feedbackTable)
			.where(whereClause)
			.orderBy(desc(feedbackTable.created_at))
			.limit(limit)
			.offset(offset),
		db
			.select({ count: count() })
			.from(feedbackTable)
			.where(whereClause)
	])

	const feedback = feedbackList.map((row) => ({
		...row,
		created_at: row.created_at instanceof Date ? row.created_at.getTime() : row.created_at
	}))
	return c.json({ feedback, total: totalResult[0]?.count ?? 0 }, 200)
})
