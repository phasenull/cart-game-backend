import { createRoute, z } from "@hono/zod-openapi"
import { ErrorResponse } from "../../../utils"
import { ILogSchema } from "./list"

export const ICreateLogDTO = ILogSchema.omit({ id: true })

export const create_log_route = createRoute({
	method: "post",
	tags: ["Logs"],
	path: "/create",
	security: [
		{
			Bearer: []
		}
	],
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean().default(true)
					})
				}
			},
			description: "Logs created successfully"
		},
		400: ErrorResponse
	},
	request: {
		body: {
			description: "Batch of log entries to create",
			content: {
				"application/json": {
					schema: z.object({
						logs: z.array(ICreateLogDTO).min(1)
					})
				}
			}
		}
	}
})
