import { board }  from "../public/board.js"
import { WebSocketServer, WebSocket } from "ws"

interface Player
{
	id: number;
	socket: WebSocket | undefined;
	y: number;
	score: number;
	pause: boolean;
	key: string;
	paddleSize: number;
}

interface Players
{
	left: Player;
	right: Player;
}

interface Ball
{
	x: number;
	y: number;
	vx: number;
	vy: number;
}

const ball: Ball =
{
	x: board.width / 2,
	y: board.height / 2,
	vx: 0,
	vy: 0
}

const players: Players =
{
	left:
	{
		id: 1,
		socket: undefined,
		y: board.height / 2,
		score: 0,
		pause: true,
		key:"none",
		paddleSize: 50
	},
	right:
	{
		id: 2,
		socket: undefined,
		y: board.height / 2,
		score: 0,
		pause: true,
		key: "none",
		paddleSize: 50
	}
};

let nbPlayer = 0

let gravity = 0.1

export function createGameServer(webSocketServer: WebSocketServer)
{
	function broadcast(data: any)
	{
		const msg = JSON.stringify(data);
		players.left.socket?.send(msg);
		players.right.socket?.send(msg);
		// for (const p of players) p.socket.send(msg);
	}

	function onConnection(webSocket: WebSocket, foo:any)
	{
		if (nbPlayer >= 2)
		{
			webSocket.send(JSON.stringify({ type: "error", message: "Partie pleine" }));
			webSocket.close();
			return;
		}
		let player: Player;
		if (players.left.socket == undefined) player = players.left;
		else player = players.right;
		nbPlayer++;
		player.socket = webSocket;
		console.log("👤 Joueur connecté:", player.id);
		webSocket.send(JSON.stringify({type:"onopen", id:player.id, message:`Bienvenue joueur ${player.id}`}))

		webSocket.on("message", (msg:any) => {
			const data = JSON.parse(msg.toString());
			if (data.type === "input") {
				player.key = data.key
				if (data.key === "up" && player.y > player.paddleSize) player.y -= 10
				if (data.key === "down" && player.y < board.height - player.paddleSize) player.y += 10
				if (data.key === "space") player.pause = !player.pause;
			}
		});

		webSocket.on("close", () => {
			if (player.socket)
			{
				player.socket = undefined;
				nbPlayer--;
			}
			console.log("🚪 Joueur déconnecté:", player.id);
		});
	}

  // Gestion des connexions
	webSocketServer.on("connection", (webSocket:WebSocket)=> onConnection(webSocket, "foo"));

// Fonction pour initialiser la balle
function resetBall(ball: Ball, players: Players) {

	// Position au centre
	ball.x = board.width / 2;
	ball.y = board.height / 2;
	ball.vx = 0
	ball.vy = 0
	gravity = 0;
	const maxVx = 8;   // vitesse horizontale maximale
	const baseVx = 4;  // vitesse de base
	const baseVy = 2;  // vitesse verticale de base

	// Calcul de la différence de score
	const diff = Math.abs(players.left.score - players.right.score);
	players.left.y = board.height / 2
	players.right.y = board.height / 2

	// Direction : vers le joueur qui mène
	const leader = players.left.score > players.right.score ? 0 : 1;
	const direction = leader === 0 ? -1 : 1; // 1 = vers joueur 2, -1 = vers joueur 1

	// Vitesse horizontale proportionnelle à l'écart de score (limite max)
	// ball.vx = 2

	// Composante verticale aléatoire
	const randomVy = Math.random() * baseVy * 2 - baseVy; // -baseVy ... +baseVy
	ball.vx = Math.min(baseVx * (1 + diff), maxVx) * direction;
	ball.vy = randomVy;
	// setTimeout(() => {
	// }, 750);
}

// Boucle du jeu (50 fps)
	setInterval(() => {
	if (nbPlayer >= 2 && !players.left.pause && !players.right.pause) {
		ball.x += ball.vx;
		ball.y += ball.vy;
		ball.vy += gravity;
		if (ball.vx === 0) { resetBall(ball, players);}
		if (ball.y > board.height - board.ballSize) {ball.vy = -1 * Math.abs(ball.vy); gravity = 0;}
		if (ball.y < board.ballSize) {ball.vy = Math.abs(ball.vy); gravity = 0;}
		const p1 = players.left;
		const p2 = players.right;
		if (ball.x <= 2 * board.paddleWidth + board.ballSize && Math.abs(ball.y - p1.y) <= p1.paddleSize) {ball.vx = Math.abs(ball.vx); if (p1.key === "up") gravity = -0.05; else if (p1.key === "down") gravity = 0.05; else gravity = 0;}
		if (ball.x >= board.width - 2 * board.paddleWidth - board.ballSize && Math.abs(ball.y - p2.y) <= p2.paddleSize) {ball.vx = -1 * Math.abs(ball.vx); if (p2.key === "up") gravity = -0.05; else if (p2.key === "down") gravity = 0.05; else gravity = 0}
		if (ball.x < 2 * board.paddleWidth + board.ballSize && ball.vx < 0)
		{
			players.right.score += 1
			resetBall(ball, players)
		}
		else if (ball.x > board.width - 2 * board.paddleWidth - board.ballSize && ball.vx > 0)
		{
			players.left.score += 1
			resetBall(ball, players)
		}
		// Diffuser l'état
		broadcast({
			type: "state",
			ball,
			players: [{id:p1.id, y:p1.y, side:0, score:p1.score, paddleSize:p1.paddleSize},
				{id:p2.id, y:p2.y, side:1, score:p2.score, paddleSize:p2.paddleSize}
			 ],
		});
	}
	}, 15);
}
