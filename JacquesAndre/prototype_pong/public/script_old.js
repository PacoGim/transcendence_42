import { board } from "./board.js"

const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")
const score = document.getElementById("score")
const buttonP1 = document.getElementById("Player1")
const buttonP2 = document.getElementById("Player2")
let ws1 = null
let ws2 = null
let state = { ball: {}, players: [] }
let modeAi1 = false
let modeAi2 = false
let player1 = null
let player2 = null
let keyState = {}

canvas.width = board.width
canvas.height = board.height
document.body.appendChild(canvas)

function handleP1()
{
	if (ws1)
	{
		ws1.close();
		ws1 = null;
		buttonP1.textContent = "Connect P1"
		return
	}

	ws1 = new WebSocket(`wss://${location.host}`)
	buttonP1.textContent = "Disconnect  P1"

	ws1.onopen = () => { console.log("P1 connected"); }

	ws1.onclose = () => {
		console.log("P1 disconnected");
		ws1 = null;
		buttonP1.textContent = "Connect P1";
	}

	ws1.onmessage = (e) => {
		const data = JSON.parse(e.data);
		if (data.type ==="onopen") { console.log(data.message); player1 = data.id; }
		else if (data.type === "state") { state = data; }
		else if (data.type === "error") { console.error(data.message); }
	}
}

function handleP2()
{
	if (ws2)
	{
		ws2.close();
		ws2 = null;
		buttonP2.textContent = "Connect P2"
		return
	}

	ws2 = new WebSocket(`wss://${location.host}`)
	buttonP2.textContent = "Disconnect  P2"

	ws2.onopen = () => { console.log("P2 connected"); }

	ws2.onclose = () => {
		console.log("P2 disconnected");
		ws2 = null;
		buttonP2.textContent = "Connect P2";
	}

	ws2.onmessage = (e) => {
		const data = JSON.parse(e.data);
		if (data.type ==="onopen") { console.log(data.message); player2 = data.id; }
		else if (data.type === "state") { state = data; }
		else if (data.type === "error") { console.error(data.message); }
	}
}
buttonP1.addEventListener("click", handleP1);
buttonP2.addEventListener("click", handleP2);

document.addEventListener("keydown", (e) => { keyState[e.key] = true })

document.addEventListener("keyup", (e)=>{ keyState[e.key] = false })

document.addEventListener("mousemove", (e) => {
	if (e.movementY > 1) { keyState["z"] = true ; keyState["a"] = false; }
	else if (e.movementY < -1){ keyState["z"] = false ; keyState["a"] = true; }
	else {keyState["z"] = false; keyState["a"] = false; }
})

function drawline(x1, y1, x2, y2)
{
	// Définir le style du trait
ctx.strokeStyle = "white";   // couleur
ctx.lineWidth = 1;         // épaisseur

// Commencer un nouveau chemin
ctx.beginPath();

// Position de départ
ctx.moveTo(x1, y1);

// Position d’arrivée
ctx.lineTo(x2, y2);

// Tracer le trait
ctx.stroke();
}

function draw()
{
	if (state.players[1]) score.innerText = `Player1 ${state.players[0].score} | Player2 ${state.players[1].score}`
	ctx.clearRect(0, 0, board.width, board.height);
	ctx.fillStyle = "white";

	// balle
	ctx.beginPath();
	ctx.arc(state.ball.x, state.ball.y, board.ballSize, 0, Math.PI * 2);
	ctx.fill();
	drawline(2 * board.paddleWidth, 0, 2 * board.paddleWidth, board.height)
	drawline(board.width - 2 * board.paddleWidth, 0, board.width - 2 * board.paddleWidth, board.height)

	// raquettes
	state.players.forEach((p) => {
		const x = p.side === 0 ? board.paddleWidth : board.width - 2 * board.paddleWidth;
		ctx.fillRect(x, p.y - p.paddleSize, board.paddleWidth, 2 * p.paddleSize);
	});
	requestAnimationFrame(draw);
}

setInterval(()=>
{
	if (keyState["i"]){ modeAi1 = !modeAi1; keyState["i"] = false;}
	if (keyState["o"]){ modeAi2 = !modeAi2; keyState["o"] = false;}
	if (keyState[" "])
	{
		if (ws1) ws1.send(JSON.stringify({ type: "input", key: "space" })); keyState[" "] = false
		if (ws2) ws2.send(JSON.stringify({ type: "input", key: "space" })); keyState[" "] = false
		return ;
	}
	if (state.players.length !== 2) return
	if (modeAi1 && ws1)
	{
		const diff1 = state.ball.y - state.players[player1-1].y
		if (diff1 > 20) ws1.send(JSON.stringify({ type: "input", key: "down" }))
		else if (diff1 < -20) ws1.send(JSON.stringify({ type: "input", key: "up" }))
		else ws1.send(JSON.stringify({type:"input", key: "none"}))
	}
	else if (ws1)
	{
		if (keyState["a"] && !keyState["z"]) ws1.send(JSON.stringify({ type: "input", key: "up" }))
		else if (!keyState["a"] && keyState["z"]) ws1.send(JSON.stringify({ type: "input", key: "down" }))
		else ws1.send(JSON.stringify({type:"input", key: "none"}))

	}
	if (!player2) return
	if (modeAi2 && ws2)
	{
		const diff2 = state.ball.y - state.players[player2-1].y
		if (diff2 > 20) ws2.send(JSON.stringify({ type: "input", key: "down" }))
		else if (diff2 < -20) ws2.send(JSON.stringify({ type: "input", key: "up" }))
		else ws2.send(JSON.stringify({type:"input", key: "none"}))
	}
	else if (ws2)
	{
		if (keyState["j"] && !keyState["n"]) ws2.send(JSON.stringify({ type: "input", key: "up"}))
		else if (!keyState["j"] && keyState["n"]) ws2.send(JSON.stringify({ type: "input", key: "down"}))
		else ws2.send(JSON.stringify({type:"input", key: "none"}))
	}
}, 20);

draw();
