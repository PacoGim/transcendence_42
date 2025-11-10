// server.ts
import Fastify from "fastify"
import fastifyWebsocket from "@fastify/websocket"
import fastifyStatic from "@fastify/static"
import { WebSocket } from "ws"
import { randomUUID } from "crypto"
import { fileURLToPath } from "url"
import path from "path"
import fs from "fs"
import { LobbyManager } from "./classes/LobbyManager.js"
import { Lobby } from "./classes/Lobby.js"
import { User } from "./classes/User.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
	https: {
		key: fs.readFileSync('/etc/ssl/private/server.key'),
		cert: fs.readFileSync('/etc/ssl/certs/server.crt')
	}
});
await fastify.register(fastifyWebsocket);

const manager = new LobbyManager();

fastify.register(fastifyStatic, {
	root: path.join(__dirname, "../public"),
});

// 👉 Création d’un lobby via HTTP
fastify.post("/lobby", async (req, reply) => {
  const id = randomUUID();
  manager.createLobby(id);
  return { lobbyId: id };
});

// 👉 Connexion WebSocket à un lobby
fastify.get<{ Params: { lobbyId: string }; Querystring: { pseudo: string } }>(
  "/lobby/:lobbyId",
  { websocket: true },
  (connection, req) => {
    const { lobbyId } = req.params;
    const { pseudo } = req.query;

    let lobby = manager.getLobby(lobbyId);
    if (!lobby) {
      // Lobby inexistant
      connection.send(
        JSON.stringify({ type: "error", text: `Lobby ${lobbyId} not found` })
      );
      setTimeout(() => connection.close(4001, "Invalid lobby"), 100);
      return;
    }

    const user = new User(randomUUID(), pseudo, connection);
    lobby.addUser(user);

    connection.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        lobby.handleMessage(user, msg);
      } catch (e) {
        console.error("Invalid message:", e);
      }
    });

    connection.on("close", () => {
      lobby.removeUser(user.id);
      if (lobby.size === 0) manager.deleteLobby(lobby.id);
    });
  }
);
const PORT = 5000

await fastify.listen({ port: PORT, host: "0.0.0.0" });
console.log(`✅ WebSocket server ready at ws://localhost:${PORT}`);
