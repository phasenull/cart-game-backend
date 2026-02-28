import { createRoute, z } from "@hono/zod-openapi"
import { ErrorResponse } from "../../../utils"

export const IJoinSessionBody = z.object({
	uuid: z.string().uuid(),
	user_id: z.number().int(),
	server_version: z.string().min(1),
	joined_at: z.number().int(),
})

export const IJoinSessionResponse = z.object({
	success: z.boolean(),
	session: z.object({
		uuid: z.string(),
		user_id: z.number(),
		server_version: z.string(),
		joined_at: z.number(),
	})
})

export const join_session_route = createRoute({
	method: "post",
	path: "/join",
	tags: ["Sessions"],
	security: [{ Bearer: [] }],
	request: {
		body: {
			content: {
				"application/json": { schema: IJoinSessionBody }
			}
		}
	},
	responses: {
		200: {
			content: {
				"application/json": { schema: IJoinSessionResponse }
			},
			description: "Session created"
		},
		400: ErrorResponse,
	}
})
