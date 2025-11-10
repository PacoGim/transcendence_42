import { board, arena }  from "../public/board.js"
import { WebSocketServer, WebSocket } from "ws"

interface Ball
{
	x: number;
	y: number;
	vx: number;
	vy: number;
}

const ball: Ball = {
	x: arena.centerX,
	y: arena.centerY,
	vx: 3,
	vy: 3
};

interface Player {
	id: number;
	socket: WebSocket | undefined;
	angle: number; // angle en radians
	spin: number;
	score: number;
	pause: boolean;
	key: string;
	paddleSize: number; // demi-angle d’ouverture du paddle
}
interface Players { left: Player; right: Player; }

const players: Players = {
	left: {
		id: 1,
		socket: undefined,
		angle: Math.PI, // gauche
		spin: 1,
		score: 0,
		pause: false,
		key: "none",
		paddleSize: 0.2, // radians ~ 11.5°
	},
	right: {
		id: 2,
		socket: undefined,
		angle: 0, // droite
		spin: -1,
		score: 0,
		pause: false,
		key: "none",
		paddleSize: 0.2,
	},
};




let nbPlayer = 0

let gravity = 0.005

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
				if (data.key === "up") player.angle += player.spin * 0.05
				if (data.key === "down") player.angle -= player.spin * 0.05
				if (data.key === "space") {player.pause = !player.pause; console.log("👤 Joueur pause:", player.id)}
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
	gravity = 0.005;
	const maxVx = 5   // vitesse horizontale maximale
	const baseVx = 2  // vitesse de base
	const baseVy = 2;  // vitesse verticale de base

	// Calcul de la différence de score
	const diff = Math.abs(players.left.score - players.right.score);
	players.left.angle = Math.PI
	players.right.angle = 0

	// Direction : vers le joueur qui mène
	const leader = players.left.score > players.right.score ? 0 : 1;
	const direction = leader === 0 ? -1 : 1; // 1 = vers joueur 2, -1 = vers joueur 1
	const randomVy = Math.random() * baseVy * 2 - baseVy; // -baseVy ... +baseVy
	ball.vx = Math.min(baseVx * (1 + diff), maxVx) * direction;
	ball.vy = randomVy;
}

// Boucle du jeu (50 fps)
	setInterval(() => {
	if (nbPlayer >= 2 && !players.left.pause && !players.right.pause) {
		ball.x += ball.vx;
		ball.y += ball.vy;
		ball.vy += gravity;
		if (ball.vx === 0) { resetBall(ball, players);}
		const dx = ball.x - arena.centerX;
		const dy = ball.y - arena.centerY;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const angleBall = Math.atan2(dy, dx); // entre -π et π

		function checkPaddleCollision(player: Player) {
			// angle du joueur
			let a = player.angle;
			let diff = Math.atan2(Math.sin(angleBall - a), Math.cos(angleBall - a)); // différence circulaire

			if (Math.abs(diff) < player.paddleSize) {
				// contact : rebond identique au mur, mais on peut ajouter un effet
				const nx = dx / dist;
				const ny = dy / dist;
				const dot = ball.vx * nx + ball.vy * ny;
				ball.vx -= 2 * dot * nx;
				ball.vy -= 2 * dot * ny;
			}
		}

		const p1 = players.left;
		const p2 = players.right;

	if (dist >= arena.radius - board.ballSize) {
	checkPaddleCollision(players.left);
	checkPaddleCollision(players.right);

	// Si la balle est sortie sans collision → point
	if (dist > arena.radius + board.ballSize) {
		if (ball.x > arena.centerX) players.left.score++;
		else players.right.score++;
		resetBall(ball, players);
	}
}

		// Diffuser l'état
		broadcast({
			type: "state",
			ball,
			players: [{id:p1.id, angle:p1.angle, side:0, score:p1.score, paddleSize:p1.paddleSize},
				{id:p2.id, angle:p2.angle, side:1, score:p2.score, paddleSize:p2.paddleSize}
			 ],
		});
	}
	}, 15);
}
