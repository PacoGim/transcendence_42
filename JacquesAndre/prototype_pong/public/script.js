import { board, arena } from "./board.js"

const canvas = document.createElement("canvas")
const score = document.getElementById("score")
const buttonLocal = document.getElementById("PlayerLocal")
const buttonOnline = document.getElementById("PlayerOnline")
const picker1 = document.getElementById("colorPickerPlayer1")
const picker2 = document.getElementById("colorPickerPlayer2")
const pickerBall = document.getElementById("colorPickerBall")
const gameContainer = document.getElementById("game-container")
const messages = document.getElementById('messages')
const input = document.getElementById('messageInput')
const messageSend = document.getElementById('messageSend')
const pseudoInput = document.getElementById('pseudoInput')
const ctx = canvas.getContext("2d")
canvas.width = board.width
canvas.height = board.height
gameContainer.appendChild(canvas);

let wslocal = null
let wsonline = null
let ws1 = null
let ws2 = null
let state = { ball: {}, players: [] }
let modeAi1 = false
let modeAi2 = false
let player1 = 1
let player2 = 2
let keyState = {}
let color1 = "#00FF00"
let color2 = "#FF0000"
let colorBall = "#FFFF00"
let color1Comp =  "#FF00FF"
let color2Comp = "#00FFFF"
let colorBallComp = "#0000FF"
let gameMode = "none"
let lobbylocalList = null

async function refreshLobbylocalList()
{
	lobbylocalList = await fetch("/lobbylocal", {method:"GET"}).then(r=>r.json())
}

function colorContrasted(hex)
{
	const r = parseInt(hex.slice(1, 3), 16)
	const g = parseInt(hex.slice(3, 5), 16)
	const b = parseInt(hex.slice(5, 7), 16)
	const rComp = 255 - r
	const gComp = 255 - g
	const bComp = 255 - b
	const compColor = `rgb(${rComp},${gComp},${bComp})`
	return compColor
}

function randomColor()
{
	const random = Math.floor(Math.random() * 0xffffff);
	const hex = random.toString(16).padStart(6, "0");
	return `#${hex}`;
}

function toggleColor()
{
	color1 = randomColor()
	color1Comp = colorContrasted(color1)
	color2 = randomColor()
	color2Comp = colorContrasted(color2)
	colorBall = randomColor()
	colorBallComp = colorContrasted(colorBall)
	score.style.color = colorBall
}

picker1.addEventListener("input", ()=>{
	color1 = picker1.value
	color1Comp = colorContrasted(color1)
	console.log({color1, color1Comp})
})
picker2.addEventListener("input", ()=>{
	color2 = picker2.value
	color2Comp = colorContrasted(color2)
	console.log({color2, color2Comp})
})
pickerBall.addEventListener("input", ()=>{
	colorBall = pickerBall.value
	colorBallComp = colorContrasted(colorBall)
	console.log({colorBall, colorBallComp})
})


async function handleLocal()
{
	if (wslocal)
	{
		wslocal?.close();
		wslocal = null;
		buttonLocal.textContent = "Play-local"
		buttonOnline.style.display = "flex"
		gameMode = "none"
		return
	}
	gameMode = "local"
	buttonOnline.style.display = "none"
	buttonLocal.textContent = "Quit-Game"
	const { lobbyId } = await fetch("/lobbylocal", { method: "POST"} ).then(r=>r.json())
	wslocal = new WebSocket(`wss://${location.host}/lobbylocal/${lobbyId}?pseudo=${pseudoInput.value}`)

	wslocal.onopen = () => { console.log(`${pseudoInput.value} connected to ${lobbyId}`); }

	wslocal.onclose = () => {
		console.log(`${pseudoInput.value} disconnected from ${lobbyId}`);
		wslocal = null;
		buttonLocal.textContent = "Play-Local";
	}
	wslocal.onmessage = (e) => {
		const data = JSON.parse(e.data);
		if (data.type ==="onopen")
		{
			console.log(data.message); player1 = data.id;
		}
		else if (data.type === "state")
		{
			state = data
			return
		}
		else if (data.type === "error")
		{
			console.error(data.message)
			wslocal?.close()
			wslocal = null
			buttonLocal.textContent = "Play-local"
			buttonOnline.style.display = "flex"
			gameMode = "none"
			return
		}
		else if (data.type === "chat")
		{
			console.log("message chat", data)
			const messageDiv = document.createElement('div')
			messageDiv.textContent = data.timestamp + " | "+ data.from + " : " + data.text
			messages.appendChild(messageDiv)
			messages.scrollTop = messages.scrollHeight
			return
		}
		else if (data.type === "system")
		{
			console.log("message system", data)
			const messageDiv = document.createElement('div')
			messageDiv.textContent = data.timestamp + " | " + data.text
			messages.appendChild(messageDiv)
			messages.scrollTop = messages.scrollHeight
			return
		}
	}
}

function handleOnline()
{
	if (ws1)
	{
		ws1.close()
		ws1 = null
		buttonOnline.textContent = "Play-Online"
		buttonLocal.style.display = "flex"
		gameMode = "none"
		return
	}
	gameMode = "online"
	buttonLocal.style.display = "none"
	buttonOnline.textContent = "Quit-Game"
	ws1 = new WebSocket(`wss://${location.host}`)

	ws1.onopen = () => { console.log("P-online connected"); }

	ws1.onclose = () => {
		console.log("P-online disconnected")
		ws1 = null
		buttonOnline.textContent = "Play-Online"
	}

	ws1.onmessage = (e) => {
		const data = JSON.parse(e.data)
		if (data.type ==="onopen") { console.log(data.message); player1 = data.id; }
		else if (data.type === "state") state = data
		else if (data.type === "error") console.error(data.message)

	}
}
function sendMessage() {
	if (input.value) {
		wslocal?.send(JSON.stringify({type:"chat", text:input.value}));
		input.value = '';
	}
}

messageSend.addEventListener("click", ()=>{ sendMessage(); })

input.addEventListener('keypress', function(e) {
	if (e.key === 'Enter') {
		sendMessage();
	}
});

buttonLocal.addEventListener("click", handleLocal)
buttonOnline.addEventListener("click", handleOnline)

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
ctx.strokeStyle = "white"   // couleur
ctx.lineWidth = 1         // épaisseur

// Commencer un nouveau chemin
ctx.beginPath()

// Position de départ
ctx.moveTo(x1, y1)

// Position d’arrivée
ctx.lineTo(x2, y2)

// Tracer le trait
ctx.stroke()
}

function draw() {
	// Score
	const player1Tag = modeAi1?"IA-1":"PLAYER-1"
	const player2Tag = modeAi2?"IA-2":"PLAYER-2"
	if (state.players[1]) score.innerText = `${player1Tag} ${state.players[0].score} | ${player2Tag} ${state.players[1].score}`

	ctx.clearRect(0, 0, board.width, board.height);
	if (state.changeColor) toggleColor()

	// Définition de l’arène
	const centerX = arena.centerX
	const centerY = arena.centerY
	const radius = arena.radius
	const paddleWidth = board.paddleWidth

	ctx.beginPath()
	ctx.arc(centerX, centerY, radius + paddleWidth / 2 , -Math.PI / 2, Math.PI / 2)
	ctx.strokeStyle = color2Comp
	ctx.lineWidth = paddleWidth
	ctx.stroke()

	ctx.beginPath()
	ctx.arc(centerX, centerY, radius + paddleWidth / 2, Math.PI / 2, -Math.PI / 2)
	ctx.strokeStyle = color1Comp
	ctx.lineWidth = paddleWidth
	ctx.stroke()

	// === Balle ===
	ctx.beginPath()
	ctx.strokeStyle = colorBall
	ctx.arc(state.ball.x, state.ball.y, board.ballSize, 0, Math.PI * 2)
	ctx.fill()
	// === Raquettes ===
	state.players.forEach((p) => {
		// Calcul de la position du paddle (centré sur l’angle du joueur)
		const aStart = p.angle - p.paddleSize
		const aEnd = p.angle + p.paddleSize

		ctx.beginPath()
		ctx.strokeStyle = p.side == 0?color1:color2
		ctx.lineWidth = paddleWidth
		ctx.arc(centerX, centerY, radius + paddleWidth / 2, aStart, aEnd)
		ctx.stroke()

		// Optionnel : petit repère pour voir le centre du joueur

		const x = centerX + (radius + paddleWidth / 2) * Math.cos(p.angle)
		const y = centerY + (radius + paddleWidth / 2) * Math.sin(p.angle)
		ctx.beginPath()
		ctx.arc(x, y, paddleWidth / 2, 0, Math.PI * 2)
		ctx.fillStyle = colorBall
		ctx.fill()

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
	const centerX = arena.centerX
	const centerY = arena.centerY
	const ball_angle = Math.atan2(state.ball.y - centerY, state.ball.x - centerX)
	if (modeAi1 && ws1 && Math.abs(ball_angle) > Math.PI / 2)
	{
		const diff1 = ball_angle - state.players[player1-1].angle
		if (diff1 > 0.2) ws1.send(JSON.stringify({ type: "input", key: "left" }))
		else if (diff1 < -0.2) ws1.send(JSON.stringify({ type: "input", key: "right" }))
		else ws1.send(JSON.stringify({type:"input", key: "none"}))
	}
	else if (ws1)
	{
		if (keyState["a"] && !keyState["z"]) ws1.send(JSON.stringify({ type: "input", key: "left" }))
		else if (!keyState["a"] && keyState["z"]) ws1.send(JSON.stringify({ type: "input", key: "right" }))
		else ws1.send(JSON.stringify({type:"input", key: "none"}))

	}
	if (!player2) return
	if (modeAi2 && ws2 && Math.abs(ball_angle) < Math.PI / 2)
	{
		const diff2 = ball_angle - state.players[player2-1].angle
		if (diff2 > 0.2) ws2.send(JSON.stringify({ type: "input", key: "right" }))
		else if (diff2 < -0.2) ws2.send(JSON.stringify({ type: "input", key: "left" }))
		else ws2.send(JSON.stringify({type:"input", key: "none"}))
	}
	else if (ws2)
	{
		if (keyState["j"] && !keyState["n"]) ws2.send(JSON.stringify({ type: "input", key: "left"}))
		else if (!keyState["j"] && keyState["n"]) ws2.send(JSON.stringify({ type: "input", key: "right"}))
		else ws2.send(JSON.stringify({type:"input", key: "none"}))
	}
}, 20);

draw();
