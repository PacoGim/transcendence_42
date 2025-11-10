import { board, arena } from "../public/board.js"
import { Player  } from "./Player.js"
import { Ball } from "./Ball.js"
import { WebSocketServer, WebSocket } from "ws"

const ball: Ball = new Ball(arena.centerX, arena.centerY, 3, 3)

const players = {
	left: new Player(1, Math.PI, 1),
	right: new Player(2, 0, -1),
}

let nbPlayer = 0
let gravity = 0.00

export function createGameServer(webSocketServer: WebSocketServer)
{
	function broadcast(data: any)
	{
		const msg = JSON.stringify(data)
		players.left.socket?.send(msg)
		players.right.socket?.send(msg)
	}//broadcast

	function onConnection(webSocket: WebSocket)
	{
		if (nbPlayer >= 2)
		{
			webSocket.send(JSON.stringify({ type: "error", message: "Partie pleine" }))
			webSocket.close()
			return
		}

		let player: Player
		if (!players.left.socket) player = players.left
		else player = players.right

		nbPlayer++
		player.socket = webSocket

		console.log("👤 Joueur connecté:", player.id)
		webSocket.send(JSON.stringify({ type: "onopen", id: player.id, message: `Bienvenue joueur ${player.id}` }))

		webSocket.on("message", (msg: any) => {
			const data = JSON.parse(msg.toString())
			if (data.type === "input")
			{
				player.key = data.key
				if (data.key === "left" || data.key === "right") player.move(data.key)
				if (data.key === "space") player.togglePause()
			}
		})

		webSocket.on("close", () => {
			player.socket = undefined
			nbPlayer--
			console.log("🚪 Joueur déconnecté:", player.id)
		})
	}

	webSocketServer.on("connection", onConnection)

	// Boucle du jeu
	setInterval(() => {
		if (nbPlayer < 2 || players.left.pause || players.right.pause) return

		ball.x += ball.vx
		ball.y += ball.vy

		const dx = ball.x - arena.centerX
		const dy = ball.y - arena.centerY
		const dist = Math.sqrt(dx * dx + dy * dy)
		let changeColor = false

		if (dist >= arena.radius - board.ballSize)
		{
			changeColor = true
			let bounced = false
			const nx = dx / dist
			const ny = dy / dist
			const angleBall = Math.atan2(dy, dx)
			const dot = ball.vx * nx + ball.vy * ny

		// collision possible avec chaque joueur
			if (Math.abs(Math.atan2(Math.sin(angleBall - players.left.angle),
								Math.cos(angleBall - players.left.angle))) < players.left.paddleSize)
			{
				ball.vx -= 2.1 * dot * nx
				ball.vy -= 2.1 * dot * ny
				bounced = true
			}
			else if (Math.abs(Math.atan2(Math.sin(angleBall - players.right.angle),
										Math.cos(angleBall - players.right.angle))) < players.right.paddleSize)
			{
				ball.vx -= 2.1 * dot * nx
				ball.vy -= 2.1 * dot * ny
				bounced = true
			}
			if (bounced)
			{
				const margin = 0.5; // petite marge
				ball.x = arena.centerX + nx * (arena.radius - board.ballSize - margin)
				ball.y = arena.centerY + ny * (arena.radius - board.ballSize - margin)

			}
			else
			{
				// sortie complète → but
				if (ball.x > arena.centerX) players.left.score++
				else players.right.score++
				ball.reset(players.left.score, players.right.score)
				players.left.resetAngle()
				players.right.resetAngle()
			}
		}

		broadcast({
			type: "state",
			ball,
			players: [
				{ id: players.left.id,
					angle: players.left.angle,
					side: 0,
					score: players.left.score,
					paddleSize: players.left.paddleSize
				},
				{ id: players.right.id,
					angle: players.right.angle,
					side: 1,
					score: players.right.score,
					paddleSize: players.right.paddleSize
				},
			],
			changeColor
		}) //broadcast()
	}, 15) //setInterval()
} //createGameServer()
