import { OpenAPIHono } from "@hono/zod-openapi"
import { sign_route } from "./routes/sign"
import { sign as jwtSign } from "hono/jwt"

export const AdminController = new OpenAPIHono()

AdminController.openapi(sign_route, async (c) => {
	const { username, password, age } = c.req.valid("json")
	
	const ADMIN_USERNAME = process.env.ADMIN_USERNAME
	const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
	
	if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
		return c.json({ error: "Admin credentials not configured" }, 500)
	}
	
	// Timing-safe comparison to prevent timing attacks
	const timingSafeEqual = (a: string, b: string): boolean => {
		const maxLength = Math.max(a.length, b.length)
		const aBuffer = new TextEncoder().encode(a.padEnd(maxLength))
		const bBuffer = new TextEncoder().encode(b.padEnd(maxLength))
		
		let result = 0
		for (let i = 0; i < maxLength; i++) {
			result |= (aBuffer[i] || 0) ^ (bBuffer[i] || 0)
		}
		return result === 0 && a.length === b.length
	}
	
	const isValidUsername = timingSafeEqual(username, ADMIN_USERNAME)
	const isValidPassword = timingSafeEqual(password, ADMIN_PASSWORD)
	
	if (!isValidUsername || !isValidPassword) {
		return c.json({ error: "Invalid credentials" }, 401)
	}
	
	// Generate JWT token
	const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-in-production"
	const expiresAt = Date.now() + (age * 24 * 60 * 60 * 1000)
	
	const token = await jwtSign(
		{
			sub: username,
			exp: Math.floor(expiresAt / 1000),
			iat: Math.floor(Date.now() / 1000)
		},
		JWT_SECRET
	)
	
	return c.json({
		token,
		expires_at: expiresAt
	}, 200)
})
