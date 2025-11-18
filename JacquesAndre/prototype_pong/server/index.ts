import Fastify from "fastify";
import { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyWebsocket from "@fastify/websocket";
import { WebSocketServer } from "ws";
import path from "path";
import { randomUUID } from "crypto"
import { fileURLToPath } from "url";
import { createGameServer } from "./game.js";
import fs from "fs"

import { LobbyManager } from "./classes/LobbyManager.js"
import { Lobby } from "./classes/Lobby.js"
import { User } from "./classes/User.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const managerlocal = new LobbyManager();

const fastify : FastifyInstance = Fastify({
	https: {
		key: fs.readFileSync('/etc/ssl/private/server.key'),
		cert: fs.readFileSync('/etc/ssl/certs/server.crt')
	}
})
await fastify.register(import('@fastify/websocket'))

// Servir les fichiers statiques (frontend)
fastify.register(fastifyStatic, {
	root: path.join(__dirname, "../public")
});

fastify.get("/lobbylocal", (req, reply)=>{
	reply.send(managerlocal)
})

fastify.get<{Params:{lobbyId:string}}>("/lobbylocal/:lobbyId", (req, reply)=>{
	const { lobbyId } = req.params
	const lobby = managerlocal?.getLobby(lobbyId)
	if (lobby) return reply.send(lobby)
	reply.statusCode = 404
	reply.send()
})

fastify.post("/lobbylocal", async (req, reply) => {
	const id = randomUUID()
	managerlocal.createLobby(id)
	return { lobbyId: id }
});

// 👉 Connexion WebSocket à un lobby
fastify.get<{ Params: { lobbyId: string }; Querystring: { pseudo: string } }>(
  "/lobbylocal/join/:lobbyId",
  { websocket: true },
  (connection, req) => {
	const { lobbyId } = req.params
	const { pseudo } = req.query

	let lobby = managerlocal.getLobby(lobbyId)
	if (!lobby)
	{
		connection.send(JSON.stringify({ type: "error", text: `Lobby ${lobbyId} not found` }))
		setTimeout(() => connection.close(4001, "Invalid lobby"), 100)
		return
	}

	const user = new User(randomUUID(), pseudo, connection)
	lobby.addUser(user)

	connection.on("message", (raw) => {
	  try
	  {
		const msg = JSON.parse(raw.toString())
		lobby.handleMessage(user, msg)
	  }
	  catch (e)
	  {
		console.error("Invalid message:", e)
	  }
	});

	connection.on("close", () => {
	  lobby.removeUser(user.id)
	  if (lobby.size === 0) managerlocal.deleteLobby(lobby.id)
	})
  }
)


const PORT = 3000

// Démarrer Fastify
const start = async () => {

	await fastify.listen({ port: PORT, host : "0.0.0.0" })
	console.log(`✅ Serveur HTTPS/WSS sur https://localhost:${PORT}`)

	// const wss = new WebSocketServer({ server: fastify.server });
	// createGameServer(wss);
  // Attacher le serveur WebSocket sur le même port
};
start();
