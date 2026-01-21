/********************** Fastify **********************/
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import cookie from '@fastify/cookie'
import fastifyStatic from '@fastify/static'
import fastifyWebsocket from '@fastify/websocket'
import cors from '@fastify/cors'

/********************** Libs **********************/
import fs from 'fs'
import path from 'path'

/********************** Functions **********************/
import __dirname, { setDirName } from './functions/dirname.fn.js'

/********************** Services **********************/
import { log } from './logs.js'
import { getVaultSecret } from './services/vault.service.js'

/********************** Routes **********************/
import { gameRoutes } from './routes/game.route.js'

setDirName(path.resolve())

const cert_crt = await getVaultSecret<string>('services_crt', (value) =>
	value.replace(/\\n/g, '\n').trim()
)
const cert_key = await getVaultSecret<string>('services_key', (value) =>
	value.replace(/\\n/g, '\n').trim()
)
if (!cert_crt || !cert_key)
	console.error('Failed to load TLS certificates from Vault service.')

const fastify: FastifyInstance = Fastify({
	https: {
		key: cert_key,
		cert: cert_crt
	}
})

await fastify.register(cors, {
	origin: ['https://localhost']
})

fastify.addHook('onResponse', (request: FastifyRequest, reply: FastifyReply) => {
	totalHttpRequests.inc({
		method: request.method,
		route: request.url,
		status_code: reply.statusCode
	})
})

fastify.register(fastifyStatic, {
	root: path.join(__dirname(), 'dist/public'),
	prefix: '/'
})

fastify.register(cookie)
await fastify.register(fastifyWebsocket)
gameRoutes(fastify)

// publicWatcher()
const start = async () => {
	try {
		await fastify.listen({ host: '0.0.0.0', port: 3333 })
		console.log('Server running on http://localhost:3333')
		log('Server running on http://localhost:3333', 'info')
	} catch (err) {
		fastify.log.error(err)
		log(`Server failed to start: ${err}`, 'error')
		process.exit(1)
	}
}

start()
