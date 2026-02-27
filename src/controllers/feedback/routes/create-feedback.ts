import { createRoute, z } from "@hono/zod-openapi"
import { ErrorResponse } from "../../../utils"

export const ICreateFeedbackBody = z.object({
	user_id: z.number().int(),
	description: z.string().min(1)
})

export const ICreateFeedbackResponse = z.object({
	success: z.boolean(),
	feedback: z.object({
		id: z.number(),
		user_id: z.number(),
		description: z.string(),
		status: z.enum(["pending", "rejected", "approved"]),
		created_at: z.number()
	})
})

export const create_feedback_route = createRoute({
	method: "post",
	path: "/",
	tags: ["Feedback"],
	security: [{ Bearer: [] }],
	request: {
		body: {
			content: {
				"application/json": { schema: ICreateFeedbackBody }
			}
		}
	},
	responses: {
		200: {
			content: {
				"application/json": { schema: ICreateFeedbackResponse }
			},
			description: "Feedback created successfully"
		},
		400: ErrorResponse
	}
})
