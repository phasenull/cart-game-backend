import { createRoute, z } from "@hono/zod-openapi"
import { ErrorResponse } from "../../../utils"

export const IListSessionsQuery = z.object({
	user_id: z
		.string()
		.transform((v) => parseInt(v))
		.pipe(z.number().int())
		.optional(),
	limit: z
		.string()
		.transform((v) => parseInt(v))
		.pipe(z.number().int().min(1).max(100))
		.optional()
		.default(50),
	offset: z
		.string()
		.transform((v) => parseInt(v))
		.pipe(z.number().int().min(0))
		.optional()
		.default(0),
})

const ISessionItem = z.object({
	uuid: z.string(),
	user_id: z.number(),
	server_version: z.string(),
	joined_at: z.number(),
	left_at: z.number().nullable(),
	playtime: z.number().nullable(),
	leave_x: z.number().nullable(),
	leave_y: z.number().nullable(),
	leave_z: z.number().nullable(),
	last_collected_checkpoint: z.number().nullable(),
})

export const IListSessionsResponse = z.object({
	sessions: z.array(ISessionItem),
	total: z.number(),
})

export const list_sessions_route = createRoute({
	method: "get",
	path: "/",
	tags: ["Sessions"],
	security: [{ Bearer: [] }],
	request: {
		query: IListSessionsQuery,
	},
	responses: {
		200: {
			content: {
				"application/json": { schema: IListSessionsResponse }
			},
			description: "Session list"
		},
		400: ErrorResponse,
		500: ErrorResponse,
	}
})
