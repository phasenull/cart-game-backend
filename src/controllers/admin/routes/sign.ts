import { createRoute, z } from "@hono/zod-openapi"

export const ISignRequest = z.object({
	username: z.string(),
	password: z.string(),
	age: z.number().int().positive().default(7).describe("JWT expiry in days")
})

export const ISignResponse = z.object({
	token: z.string(),
	expires_at: z.number().describe("Unix timestamp in milliseconds")
})

export const sign_route = createRoute({
	method: "post",
	path: "/sign",
	tags: ["Admin"],
	responses: {
		200: {
			content: {
				"application/json": {
					schema: ISignResponse
				}
			},
			description: "JWT token generated successfully"
		},
		401: {
			content: {
				"application/json": {
					schema: z.object({
						error: z.string()
					})
				}
			},
			description: "Invalid credentials"
		},
		500: {
			content: {
				"application/json": {
					schema: z.object({
						error: z.string()
					})
				}
			},
			description: "Server error"
		}
	},
	request: {
		body: {
			description: "Admin credentials",
			content: {
				"application/json": {
					schema: ISignRequest
				}
			}
		}
	}
})
