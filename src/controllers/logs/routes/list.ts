import { createRoute, z } from "@hono/zod-openapi"
import { createSelectSchema } from "drizzle-orm/zod"
import { logsTable } from "../../../schema"

export const ILogSchema = createSelectSchema(logsTable)

export const IListLogsResponse = z.object({
	logs: z.array(ILogSchema)
})

export const list_route = createRoute({
	method: "get",
	tags: ["Logs"],
	path: "/list",
	security: [
		{
			Bearer: []
		}
	],
	responses: {
		200: {
			content: {
				"application/json": {
					schema: IListLogsResponse
				}
			},
			description: "Logs retrieved successfully"
		}
	}
})
