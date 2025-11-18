import { board, arena } from "./board.ts"
import { color } from "./pickerColor.ts"

const score = document.getElementById("score")
const gameContainer = document.getElementById("game-container")
const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")
canvas.width = board.width
canvas.height = board.height
gameContainer?.appendChild(canvas);

let state = { ball: {x:0, y:0}, players: [
	{score:0, pseudo:"player1", angle:0, side:0, paddleSize:10},
	{score:0, pseudo:"player", angle:0, side:1, paddleSize:1}],
	changeColor: false }
let keyState : any  = {}
let side = "middle"
let modeAI = false

let wss : any = null

export function setWss(webSocket : any, cote: string)
{
	wss = webSocket
	side = cote
	wss.onmessage = (e: any) =>
	{
		const data = JSON.parse(e.data)
		if (data.type === "state") state = data
	}
	start()
}

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
	let player1Tag = state.players[0].pseudo
	let player2Tag = state.players[1].pseudo
	if (modeAI && side ==="left") player1Tag += " (AI)"
	if (modeAI && side ==="right") player2Tag += " (AI)"
	if (state.players[1]) score!.innerText = `${player1Tag} ${state.players[0].score} | ${player2Tag} ${state.players[1].score}`

	ctx.clearRect(0, 0, board.width, board.height);
	if (state.changeColor) color.toggleColor()

	// Définition de l’arène
	const centerX = arena.centerX
	const centerY = arena.centerY
	const radius = arena.radius
	const paddleWidth = board.paddleWidth

	ctx.beginPath()
	ctx.arc(centerX, centerY, radius + paddleWidth / 2 , -Math.PI / 2, Math.PI / 2)
	ctx.strokeStyle = color.color2Comp
	ctx.lineWidth = paddleWidth
	ctx.stroke()

	ctx.beginPath()
	ctx.arc(centerX, centerY, radius + paddleWidth / 2, Math.PI / 2, -Math.PI / 2)
	ctx.strokeStyle = color.color1Comp
	ctx.lineWidth = paddleWidth
	ctx.stroke()

	// === Balle ===
	ctx.beginPath()
	ctx.strokeStyle = color.colorBall
	ctx.arc(state.ball.x, state.ball.y, board.ballSize, 0, Math.PI * 2)
	ctx.fill()
	// === Raquettes ===
	state.players.forEach((p) => {
		// Calcul de la position du paddle (centré sur l’angle du joueur)
		const aStart = p.angle - p.paddleSize
		const aEnd = p.angle + p.paddleSize

		ctx.beginPath()
		ctx.strokeStyle = p.side == 0?color.color1:color.color2
		ctx.lineWidth = paddleWidth
		ctx.arc(centerX, centerY, radius + paddleWidth / 2, aStart, aEnd)
		ctx.stroke()

		// Optionnel : petit repère pour voir le centre du joueur

		const x = centerX + (radius + paddleWidth / 2) * Math.cos(p.angle)
		const y = centerY + (radius + paddleWidth / 2) * Math.sin(p.angle)
		ctx.beginPath()
		ctx.arc(x, y, paddleWidth / 2, 0, Math.PI * 2)
		ctx.fillStyle = color.colorBall
		ctx.fill()

	});
	requestAnimationFrame(draw);
}
const debug = document.getElementById("debug")

function start()
{
	setInterval(async ()=>
	{
		if (keyState["i"]){ modeAI = !modeAI; keyState["i"] = false;}
		if (keyState[" "])
			return wss?.send(JSON.stringify({ type: "input", key: "space" })); keyState[" "] = false
		if (state.players.length !== 2) return
		const centerX = arena.centerX
		const centerY = arena.centerY
		const ball_angle = Math.atan2(state.ball.y - centerY, state.ball.x - centerX)
		const diff1 = arena.centerY - state.ball.y + arena.radius * Math.sin(state.players[0].angle)
		debug!.innerHTML = `ball_angle ${ball_angle} <br> player_angle ${state.players[0].angle} <br> diff ${diff1} <br> ball_y ${arena.centerY - state.ball.y} <br> player_y ${-1 *arena.radius * Math.sin(state.players[0].angle)}`
		if (modeAI && side==="left")
		{
			if (diff1 < -20) wss.send(JSON.stringify({ type: "input", key: "right" }))
			else if (diff1 > 20) wss.send(JSON.stringify({ type: "input", key: "left" }))
			else wss.send(JSON.stringify({type:"input", key: "none"}))
			return
		}
		if (modeAI && side==="right")
		{
			const diff2 = ball_angle - state.players[1].angle
			if (diff2 > 0.2) wss.send(JSON.stringify({ type: "input", key: "right" }))
			else if (diff2 < -0.2) wss.send(JSON.stringify({ type: "input", key: "left" }))
			else wss.send(JSON.stringify({type:"input", key: "none"}))
			return
		}
		if (keyState["a"] && !keyState["z"]) wss?.send(JSON.stringify({ type: "input", key: "left" }))
		else if (!keyState["a"] && keyState["z"]) wss?.send(JSON.stringify({ type: "input", key: "right" }))
		else wss?.send(JSON.stringify({type:"input", key: "none"}))
	}, 20);

	draw()
}

