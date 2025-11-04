import { routes } from './router'
import { BunRequest } from 'bun'

Bun.serve({
	port: 3001,
	routes,
	fetch: () => new Response('Page not found', { status: 404 })
})
