import { json_stringify } from "../../../shared/json_wrapper.ts"
import { board, arena } from "./board.ts"
import { color, toggleColor } from "./pickerColor.ts"

const score = document.getElementById("score")
const gameContainer = document.getElementById("game-container")
const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")
canvas.width = board.width
canvas.height = board.height
gameContainer?.appendChild(canvas);

let state = { ball: {dist:0, theta:0}, players: [
	{score:0, pseudo:"player0", angle:0, minAngle:0, maxAngle:0, paddleSize:10}],
	changeColor: false }
let end : any = null
let keyState : any  = {}
let modeAI = true
let pseudo = ""
let anglePlayer = -1

let wss : any = null

export function setWss(webSocket : any, pseu:string)
{
	console.log("start a new game")
	wss = webSocket
	pseudo = pseu
	anglePlayer = -1
	wss.onmessage = (e: any) =>
	{
		const data = JSON.parse(e.data)
		if (data.type === "state")
		{
			state = data
			if (anglePlayer === -1)
			{
				anglePlayer = initAnglePlayer(state.players)
				console.log("anglePlayer", anglePlayer)
			}
			if (end)
			{
				console.log("reset end")
			}
		}
		else if (data.type === "end")
		{
			end = data.end
			console.log("data.end",data.end)
		}
	}//onmessage
	modeAI = true
	end = null
	start()
}//setWss

document.addEventListener("keydown", (e) => { keyState[e.key] = true })

document.addEventListener("keyup", (e)=>{ keyState[e.key] = false })

// document.addEventListener("mousemove", (e) => {
// 	if (e.movementY > 1) { keyState["z"] = true ; keyState["a"] = false; }
// 	else if (e.movementY < -1){ keyState["z"] = false ; keyState["a"] = true; }
// 	else {keyState["z"] = false; keyState["a"] = false; }
// })

function draw()
{
	if (!ctx) return
	// Score
	if (end?.message) return score!.innerText = end.message
	score!.innerText = formatScore(state.players)
	ctx.clearRect(0, 0, board.width, board.height);
	if (state.changeColor) toggleColor()

	// Définition de l’arène
	const centerX = arena.centerX
	const centerY = arena.centerY
	const radius = arena.radius
	const paddleWidth = board.paddleWidth

	// === Balle ===
	ctx.beginPath()
	ctx.strokeStyle = color.colorBall
	const ballX = arena.centerX + state.ball.dist * Math.cos(state.ball.theta + anglePlayer)
	const ballY = arena.centerY + state.ball.dist * Math.sin(state.ball.theta + anglePlayer)
	ctx.arc(ballX, ballY, board.ballSize, 0, Math.PI * 2)
	ctx.fill()

	debug!.innerHTML = `x ${Math.round(ballX)} | y ${Math.round(ballY)} | r ${Math.round(state?.ball?.dist)} | theta ${Math.round(state?.ball?.theta*5729)/100}`

	state.players.forEach((p, index : number) => {
		// Calcul de la position du paddle (centré sur l’angle du joueur)
		const aStart = p.angle - p.paddleSize + anglePlayer
		const aEnd = p.angle + p.paddleSize + anglePlayer
		const bgStart = p.minAngle + anglePlayer
		const bgEnd = p.maxAngle + anglePlayer

		// background player
		ctx.beginPath()
		ctx.strokeStyle = color.playerComp[index]
		ctx.lineWidth = paddleWidth
		ctx.arc(centerX, centerY, radius + paddleWidth / 2, bgStart, bgEnd)
		ctx.stroke()

		// paddle player
		ctx.beginPath()
		ctx.strokeStyle = color.player[index]
		ctx.lineWidth = paddleWidth
		ctx.arc(centerX, centerY, radius + paddleWidth / 2, aStart, aEnd)
		ctx.stroke()

		// Optionnel : petit repère pour voir le centre du joueur
		const x = centerX + (radius + paddleWidth / 2) * Math.cos(p.angle + anglePlayer)
		const y = centerY + (radius + paddleWidth / 2) * Math.sin(p.angle + anglePlayer)
		ctx.beginPath()
		ctx.arc(x, y, paddleWidth / 2, 0, Math.PI * 2)
		ctx.fillStyle = color.colorBall
		ctx.fill()

	});

	requestAnimationFrame(draw);
}//draw
const debug = document.getElementById("debug")

function start()
{
	const idInterval = setInterval(async ()=>
	{
		if (end) return clearInterval(idInterval)
		if (keyState["i"]){ modeAI = !modeAI; keyState["i"] = false;}
		if (keyState[" "])
			return wss?.send(json_stringify({ type: "input", key: "space" })); keyState[" "] = false
		if (modeAI) return wss?.send(json_stringify({type:"input", key:"chatGPT"}))
		if (keyState["s"] && !keyState["d"]) wss?.send(json_stringify({ type: "input", key: "-" }))
		else if (!keyState["s"] && keyState["d"]) wss?.send(json_stringify({ type: "input", key: "+" }))
		else wss?.send(json_stringify({type:"input", key: "none"}))
	}, 20)

	draw()
}//start

function formatScore(players: any) : string
{
  if (!players.length) return "";

  // Tri décroissant par score
  const sorted = [...players].sort((a, b) => b.score - a.score);

  // Le meilleur joueur reçoit la couronne
  const bestScore : number = sorted[0].score;

  return players
    .map((p : any) => {
      const crown = p.score === bestScore ? " 👑" : ""
      return `${p.pseudo.slice(0,4)}${crown} (${p.score})`
    })
    .join(" | ");
}

function initAnglePlayer(players : any) : number
{
	console.log("pseudo", pseudo, "players", players)
	const nbPlayer : number = players.length
	for (let index = 0; index < nbPlayer; index++)
		if (players[index].pseudo === pseudo)
			return Math.PI * (0.5 - (1 + 2*index) / nbPlayer)

	return 0
}
