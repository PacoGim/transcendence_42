import { board, arena } from "./board.js"
import { Player  } from "./Player.js"
import { Ball } from "./Ball.js"
import User from "./User.js"

const conv = 57.2957795131

export default function createGameServer(player0 : User, player1: User)
{
	if (!player0 || !player1) return
	const ball: Ball = new Ball(arena.centerX, arena.centerY, 3, 3)

	const players = [
		new Player(0, 2, player0),
		new Player(1, 2, player1),
	]

	let gravity = 0.00
	function broadcast(data: any)
	{
		const msg = JSON.stringify(data)
		players.forEach(p=>p.user.socket?.send(msg))
	}//broadcast

	console.log("👤 Joueurs connectés")

	players.forEach(p=>{
		p.user.socket?.on("message", (msg:any)=>{
		const data = JSON.parse(msg.toString())
			if (data.type === "input")
			{
				p.key = data.key
				if (data.key === "-" || data.key === "+") p.move(data.key)
				if (data.key === "space") p.togglePause()
			}
		})
		p.user.socket?.on("close", ()=>players.forEach(p=>p.user.status = "chat"))
	})

	// players.player0.user.socket?.on("message", (msg: any) => {
	// 	const data = JSON.parse(msg.toString())
	// 	if (data.type === "input")
	// 	{
	// 		players.player0.key = data.key
	// 		if (data.key === "-" || data.key === "+") players.player0.move(data.key)
	// 		if (data.key === "space") players.player0.togglePause()
	// 	}
	// })

	// players.player0.user.socket?.on("close", () => {
	// 	players.player0.user.status = "chat"
	// 	players.player1.user.status = "chat"
	// })

	// players.player1.user.socket?.on("message", (msg: any) => {
	// 	const data = JSON.parse(msg.toString())
	// 	if (data.type === "input")
	// 	{
	// 		players.player1.key = data.key
	// 		if (data.key === "-" || data.key === "+") players.player1.move(data.key)
	// 		if (data.key === "space") players.player1.togglePause()
	// 	}
	// })

	// players.player1.user.socket?.on("close", () => {
	// 	players.player0.user.status = "chat"
	// 	players.player1.user.status = "chat"
	// })



	// Boucle du jeu
	const idInterval = setInterval(() => {
		if (players.some(p=>p.pause)) return

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
			let endgame = false
			const nx = dx / dist
			const ny = dy / dist
			let angleBall = Math.atan2(dy, dx)
			if (angleBall < Math.PI / 2) angleBall += 2 * Math.PI
			const dot = ball.vx * nx + ball.vy * ny
			// console.log({angleBall:Math.round(angleBall * conv), p0min:Math.round(players.player0.minAngle * conv), p0max:Math.round(players.player0.maxAngle * conv), p1min:Math.round(players.player1.minAngle * conv), p1max:Math.round(players.player1.maxAngle * conv)})

			for (let p of players)
			{
				if (angleBall >= p.minAngle && angleBall <= p.maxAngle)
				{
					if (angleBall >= p.angle - p.paddleSize && angleBall <= p.angle + p.paddleSize)
					{
						console.log("collision player0", Math.round(angleBall * conv), Math.round(p.minAngle * conv), Math.round(p.maxAngle * conv))
						bounced = true
					}
					else
					{
						p.score--
						if(p.score === 0) endgame = true
					}
					break
				}
			}

			// if (angleBall >= players.player0.minAngle && angleBall <= players.player0.maxAngle)
			// {
			// 	if (angleBall >= players.player0.angle - players.player0.paddleSize && angleBall <= players.player0.angle + players.player0.paddleSize)
			// 	{
			// 		console.log("collision player0", Math.round(angleBall * conv), Math.round(players.player0.minAngle * conv), Math.round(players.player0.maxAngle * conv))
			// 		bounced = true
			// 	}
			// 	else
			// 	{
			// 		if(--players.player0.score === 0) endgame = true
			// 	}
			// }
			// else if (angleBall >= players.player1.minAngle && angleBall <= players.player1.maxAngle)
			// {
			// 	if (angleBall >= players.player1.angle - players.player1.paddleSize && angleBall <= players.player1.angle + players.player1.paddleSize)
			// 	{
			// 		console.log("collision player1", Math.round(angleBall * conv), Math.round(players.player1.minAngle * conv), Math.round(players.player1.maxAngle * conv))
			// 		bounced = true
			// 	}
			// 	else
			// 	{
			// 		if(--players.player1.score === 0) endgame = true
			// 	}
			// }
		// collision possible avec chaque joueur
			// if (Math.abs(Math.atan2(Math.sin(angleBall - players.player0.angle),
			// 					Math.cos(angleBall - players.player0.angle))) < players.player0.paddleSize)
			// {
			// }
			// else if (Math.abs(Math.atan2(Math.sin(angleBall - players.player1.angle),
			// 							Math.cos(angleBall - players.player1.angle))) < players.player1.paddleSize)
			// {
			// }
			if (endgame)
			{
				const message : string = formatRanking(players)
				broadcast({
					type:"end",
					end: {message}
						})
				players.forEach(p=>p.user.status = "chat")
				return clearInterval(idInterval)
			}
			if (bounced)
			{
				ball.vx -= 2.1 * dot * nx
				ball.vy -= 2.1 * dot * ny
				const margin = 0.5; // petite marge
				ball.x = arena.centerX + nx * (arena.radius - board.ballSize - margin)
				ball.y = arena.centerY + ny * (arena.radius - board.ballSize - margin)

			}
			else
			{
				ball.reset(getRandomWeightedPlayer(players).defaultAngle)
				players.forEach(p=>p.resetAngle())
			}
		}

		broadcast({
			type: "state",
			ball,
			players: players.map((p,index)=>{
					return {
						pseudo:p.user.pseudo,
						angle:p.angle,
						side:index,
						score:p.score,
						paddleSize:p.paddleSize
					}
				}),
			// [
			// 	{
			// 		pseudo:players.player0.user.pseudo,
			// 		angle: players.player0.angle,
			// 		side: 0,
			// 		score: players.player0.score,
			// 		paddleSize: players.player0.paddleSize
			// 	},
			// 	{
			// 		pseudo:players.player1.user.pseudo,
			// 		angle: players.player1.angle,
			// 		side: 1,
			// 		score: players.player1.score,
			// 		paddleSize: players.player1.paddleSize
			// 	},
			// ],
			changeColor
		}) //broadcast()
	}, 15) //setInterval()
} //createGameServer()

function formatRanking(players:any) {
  if (!players.length) return "";

  // Tri décroissant par score
  const sorted = [...players].sort((a, b) => b.score - a.score);

  // Le meilleur joueur reçoit la couronne
  const bestScore = sorted[0].score;

  return sorted
    .map(p => {
      const crown = p.score === bestScore ? " 👑" : "";
      return `${p.user.pseudo}${crown} (${p.score}pts)`;
    })
    .join(", ");
}

function getRandomWeightedPlayer(players:any) : Player
{
	const total = players.reduce((sum:number, p:Player) => sum + p.score, 0);
	if (total === 0) return players[Math.floor(Math.random() * players.length)];

	let r = Math.random() * total;

	for (const p of players)
	{
		if (r < p.score) return p;
		r -= p.score;
	}

	return players[players.length - 1]; // fallback (normalement jamais utilisé)
}
