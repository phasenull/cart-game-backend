import { createRoute, z } from "@hono/zod-openapi";
import { ErrorResponse } from "../../../utils";

export const IListFeedbackQuery = z.object({
	status: z.enum(["pending", "rejected", "approved"]).optional(),
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
});

const IFeedbackItem = z.object({
	id: z.number(),
	user_id: z.number(),
	description: z.string(),
	status: z.enum(["pending", "rejected", "approved"]),
	response: z.string().nullable(),
	responded_at: z.number().nullable(),
	deleted_at: z.number().nullable(),
	created_at: z.number(),
});

export const IListFeedbackResponse = z.object({
	feedback: z.array(IFeedbackItem),
	total: z.number(),
});

export const list_feedback_route = createRoute({
	method: "get",
	path: "/",
	tags: ["Feedback"],
	security: [{ Bearer: [] }],
	request: {
		query: IListFeedbackQuery,
	},
	responses: {
		200: {
			content: {
				"application/json": { schema: IListFeedbackResponse },
			},
			description: "Feedback list",
		},
		400: ErrorResponse,
	},
});
