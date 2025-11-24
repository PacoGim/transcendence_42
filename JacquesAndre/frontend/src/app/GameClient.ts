import { json_stringify } from "../../../shared/json_wrapper.ts"
import { board, arena } from "./board.ts"
import { color, toggleColor } from "./pickerColor.ts"
import type { Impact } from "../../../backend/classes/Ball.ts"

const score = document.getElementById("score")
const gameContainer = document.getElementById("game-container")
const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")
canvas.width = board.width
canvas.height = board.height
gameContainer?.appendChild(canvas);

let state = { ball: {dist:0, theta:0, x:0, y:0}, message:"", impacts: [], players: [
	{score:0, pseudo:"player0", angle:0, minAngle:0, maxAngle:0, paddleSize:10}],
	changeColor: false }
let end : boolean = false
let keyState : any  = {}
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
		}
		else if (data.type === "end")
		{
			state = data
			end = true
			console.log("data.end",data)
		}
	}//onmessage
	end = false
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
	requestAnimationFrame(draw)
	if (!ctx) return
	if (!state) return
	if (!state.players) return
	if (end) return score!.innerHTML = formatScore(state.players, true)
	score!.innerHTML = formatScore(state.players)
	if (!state.ball) return
	ctx.clearRect(0, 0, board.width, board.height);
	if (state.changeColor) toggleColor()

	drawPredictionsRotated(ctx, {...state.ball}, state.impacts, {x:arena.centerX, y:arena.centerY}, anglePlayer)


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

	// debug!.innerHTML = `x ${Math.round(ballX)} | y ${Math.round(ballY)} | r ${Math.round(state?.ball?.dist)} | theta ${Math.round(state?.ball?.theta*5729)/100}`
	debug!.textContent = state.message
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

}//draw
const debug = document.getElementById("debug")

function start()
{
	draw()
	const idInterval = setInterval(async ()=>
	{
		if (end) return clearInterval(idInterval)
		if (keyState["i"])
		{
			keyState["i"] = false
			return wss?.send(json_stringify({type:"input", key:"chatGPT"}))
		}
		if (keyState[" "])
		{
			keyState[" "] = false
			return wss?.send(json_stringify({ type: "input", key: "space" }))
		}
		if (keyState["s"] && !keyState["d"]) wss?.send(json_stringify({ type: "input", key: "-" }))
		else if (!keyState["s"] && keyState["d"]) wss?.send(json_stringify({ type: "input", key: "+" }))
	}, 10)
}//start

function formatScore(players: any, end: boolean = false) : string
{
	if (!players.length) return "";

	let bestScore = 0
	players.forEach((p:any)=>{ if (p.score > bestScore) bestScore = p.score })

	const colored = players.map((p:any, index:number)=>{return {...p, bg:color.player[index], color:color.playerComp[index]}})

	if (end) colored.sort((a:any, b:any)=> b.score - a.score)
	return colored
		.map((p : any) => {
			const crown = p.score === bestScore ? "👑" : ""
			const AI = p.ai?"🤖":""
			return `<span style="background-color:${p.bg}; color:${p.color};" class="font-extrabold whitespace-nowrap break-keep">${AI}${p.pseudo.slice(0,5)}${crown} (${p.score})</span>`
	})
	.join("");
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

interface Point {
    x: number;
    y: number;
}

/**
 * Applique une rotation autour d'un centre à un point
 * @param p Point à transformer
 * @param cx Centre X
 * @param cy Centre Y
 * @param angle Angle en radians (sens trigonométrique)
 */
function rotatePoint(p: Point, cx: number, cy: number, angle: number): Point {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    return {
        x: cx + dx * cosA - dy * sinA,
        y: cy + dx * sinA + dy * cosA
    };
}

/**
 * Dessine une ligne entre deux points
 */
function drawLine(ctx: CanvasRenderingContext2D, p1: Point, p2: Point, color: string = 'black', width: number = 1) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

/**
 * Dessine les prédictions avec rotation autour d'un centre
 * @param ctx CanvasRenderingContext2D
 * @param ball Position initiale de la balle
 * @param impacts Liste des impacts
 * @param center Centre de rotation (souvent arena.centerX, arena.centerY)
 * @param angle Angle de rotation (en radians)
 */
function drawPredictionsRotated(
    ctx: CanvasRenderingContext2D,
    ball: Point,
    impacts: Impact[],
    center: Point,
    angle: number
) {
    if (impacts.length === 0) return;

    // Point initial
    let prev = rotatePoint(ball, center.x, center.y, angle);

    for (let i = 0; i < impacts.length; i++) {
        const next = rotatePoint({ x: impacts[i].impactX, y: impacts[i].impactY }, center.x, center.y, angle);
        drawLine(ctx, prev, next, 'yellow', 2);
        prev = next;
    }
}

