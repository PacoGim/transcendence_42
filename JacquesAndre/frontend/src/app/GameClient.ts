import { board, arena } from "./board.ts"
import { color, toggleColor } from "./pickerColor.ts"

const score = document.getElementById("score")
const gameContainer = document.getElementById("game-container")
const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")
canvas.width = board.width
canvas.height = board.height
gameContainer?.appendChild(canvas);

let state = { ball: {x:0, y:0}, players: [
	{score:0, pseudo:"player0", angle:0, side:0, paddleSize:10},
	{score:0, pseudo:"player1", angle:0, side:1, paddleSize:1}],
	changeColor: false }
let end : any = null
let keyState : any  = {}
let side = -1
let modeAI = true

let wss : any = null

export function setWss(webSocket : any, nb: number)
{
	console.log("start a new game")
	wss = webSocket
	side = nb
	wss.onmessage = (e: any) =>
	{
		const data = JSON.parse(e.data)
		if (data.type === "state")
		{
			console.log("received: ", data)
			state = data
			if (end)
			{
				console.log("reset end")
			}
		}
		else if (data.type === "end")
		{
			end = data.end
			console.log(data.end)
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
	let player1Tag = state.players[0].pseudo
	let player2Tag = state.players[1].pseudo
	if (modeAI && side === 0) player1Tag += " (AI)"
	if (modeAI && side === 1) player2Tag += " (AI)"
	if (state.players[1]) score!.innerText = `${player1Tag} ${state.players[0].score} | ${player2Tag} ${state.players[1].score}`
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
	ctx.arc(state.ball.x, state.ball.y, board.ballSize, 0, Math.PI * 2)
	ctx.fill()

	const nbPlayer = state.players.length
	state.players.forEach((p, index : number) => {
		// Calcul de la position du paddle (centré sur l’angle du joueur)
		const aStart = p.angle - p.paddleSize
		const aEnd = p.angle + p.paddleSize
		const bgStart = (Math.PI / 2) + (2 * index * Math.PI / nbPlayer)
		const bgEnd = (Math.PI / 2) + (2 * (index + 1) * Math.PI / nbPlayer)

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
		const x = centerX + (radius + paddleWidth / 2) * Math.cos(p.angle)
		const y = centerY + (radius + paddleWidth / 2) * Math.sin(p.angle)
		ctx.beginPath()
		ctx.arc(x, y, paddleWidth / 2, 0, Math.PI * 2)
		ctx.fillStyle = color.colorBall
		ctx.fill()

	});
	requestAnimationFrame(draw);
}//draw
// const debug = document.getElementById("debug")

function start()
{
	const idInterval = setInterval(async ()=>
	{
		if (end) return clearInterval(idInterval)
		if (keyState["i"]){ modeAI = !modeAI; keyState["i"] = false;}
		if (keyState[" "])
			return wss?.send(JSON.stringify({ type: "input", key: "space" })); keyState[" "] = false
		if (state.players.length !== 2) return
		// const centerX = arena.centerX
		// const centerY = arena.centerY
		// const ball_angle = Math.atan2(state.ball.y - centerY, state.ball.x - centerX)
		const diff1 = arena.centerY - state.ball.y + arena.radius * Math.sin(state.players[0].angle)
		const diff2 = arena.centerY - state.ball.y + arena.radius * Math.sin(state.players[1].angle)
		// debug!.innerHTML = `diff1 ${diff1} <br> diff2 ${diff2}`
		if (modeAI && side=== 0)
		{
			if (diff1 < -20) wss.send(JSON.stringify({ type: "input", key: "+" }))
			else if (diff1 > 20) wss.send(JSON.stringify({ type: "input", key: "-" }))
			else wss.send(JSON.stringify({type:"input", key: "none"}))
			return
		}
		if (modeAI && side=== 1)
		{
			if (diff2 < -20) wss.send(JSON.stringify({ type: "input", key: "-" }))
			else if (diff2 > 20) wss.send(JSON.stringify({ type: "input", key: "+" }))
			else wss.send(JSON.stringify({type:"input", key: "none"}))
			return
		}
		if (keyState["s"] && !keyState["d"]) wss?.send(JSON.stringify({ type: "input", key: "-" }))
		else if (!keyState["s"] && keyState["d"]) wss?.send(JSON.stringify({ type: "input", key: "+" }))
		else wss?.send(JSON.stringify({type:"input", key: "none"}))
	}, 20)

	draw()
}//start

