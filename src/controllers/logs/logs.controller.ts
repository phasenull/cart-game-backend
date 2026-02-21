import { OpenAPIHono } from "@hono/zod-openapi"
import { type Database } from "../../utils"
import { logsTable } from "../../schema"
import { desc } from "drizzle-orm"
import { list_route } from "./routes/list"
import { create_log_route } from "./routes/create-log"

type Bindings = {
	DB: any
}

type Variables = {
	db: Database
}

export const LogsController = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

LogsController.openapi(list_route, async (c) => {
	const db = c.get("db")
	const logs = await db.select().from(logsTable).orderBy(desc(logsTable.created_at))
	return c.json({ logs }, 200)
})

LogsController.openapi(create_log_route, async (c) => {
	const db = c.get("db")
	const { logs } = await c.req.json()
	if (!logs || logs.length === 0) {
		return c.json({ error: "Missing required field: logs" }, 400)
	}
	await db.insert(logsTable).values(
		logs.map((log: any) => ({
			job_id: log.job_id,
			context: log.context,
			message: log.message,
			type: log.type ?? null,
			created_at: log.created_at ?? Date.now(),
			published_version: log.published_version ?? null
		}))
	)
	return c.json({ success: true }, 200)
})
