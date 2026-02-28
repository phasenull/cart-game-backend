import { createRoute, z } from "@hono/zod-openapi"
import { ErrorResponse } from "../../../utils"

export const ILeaveSessionBody = z.object({
	uuid: z.string().uuid(),
	left_at: z.number().int(),
	playtime: z.number().int(),
	leave_x: z.number().int(),
	leave_y: z.number().int(),
	leave_z: z.number().int(),
	last_collected_checkpoint: z.number().int(),
})

export const ILeaveSessionResponse = z.object({
	success: z.boolean(),
	session: z.object({
		uuid: z.string(),
		user_id: z.number(),
		server_version: z.string(),
		joined_at: z.number(),
		left_at: z.number(),
		playtime: z.number(),
		leave_x: z.number(),
		leave_y: z.number(),
		leave_z: z.number(),
		last_collected_checkpoint: z.number(),
	})
})

export const leave_session_route = createRoute({
	method: "post",
	path: "/leave",
	tags: ["Sessions"],
	security: [{ Bearer: [] }],
	request: {
		body: {
			content: {
				"application/json": { schema: ILeaveSessionBody }
			}
		}
	},
	responses: {
		200: {
			content: {
				"application/json": { schema: ILeaveSessionResponse }
			},
			description: "Session updated with leave data"
		},
		400: ErrorResponse,
		404: ErrorResponse,
	}
})
