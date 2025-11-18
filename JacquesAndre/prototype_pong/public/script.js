import { board, arena } from "./board.js"
import { color } from "./pickerColor.js"

const score = document.getElementById("score")
const buttonLocal = document.getElementById("PlayerLocal")
const buttonOnline = document.getElementById("PlayerOnline")

const messages = document.getElementById('messages')
const input = document.getElementById('messageInput')
const messageSend = document.getElementById('messageSend')
const pseudoInput = document.getElementById('pseudoInput')
const lobbys = document.getElementById('lobbys')

const gameContainer = document.getElementById("game-container")
const canvas = document.createElement("canvas")
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

let gameMode = "none"
let lobbylocalList = null

async function refreshLobbylocalList()
{
	lobbys.replaceChildren();
	lobbylocalList = await fetch("/lobbylocal", {method:"GET"}).then(r=>r.json())
	console.log(lobbylocalList)
	if (!lobbylocalList || lobbylocalList.size == 0)
	{
		const { lobbyId } = await fetch("/lobbylocal", { method: "POST"} ).then(r=>r.json())
		const buttonJoin = document.createElement("button");
		buttonJoin.textContent = lobbyId
		buttonJoin.addEventListener("click", (ev)=>{
			handleLocal(lobbyId);
		})
		lobbys.appendChild(buttonJoin)
		return
	}
	lobbylocalList?.lobbies.forEach((lobby, idx)=>{
		const buttonJoin = document.createElement("button");
		buttonJoin.textContent = lobby.id
		buttonJoin.addEventListener("click", (ev)=>{
			handleLocal(lobby.id);
		})
		lobbys.appendChild(buttonJoin)
	})
}

await refreshLobbylocalList()

async function handleLocal(lobbyIdArg)
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
	if (!lobbyIdArg)
	{
		const {lobbyId} = await fetch("/lobbylocal", { method: "POST"} ).then(r=>r.json())
		lobbyIdArg = lobbyId
	}
	wslocal = new WebSocket(`wss://${location.host}/lobbylocal/join/${lobbyIdArg}?pseudo=${pseudoInput.value}`)

	wslocal.onopen = () => { console.log(`${pseudoInput.value} connected to ${lobbyIdArg}`); }

	wslocal.onclose = () => {
		console.log(`${pseudoInput.value} disconnected from ${lobbyIdArg}`);
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

buttonLocal.addEventListener("click", () => handleLocal(null))
buttonOnline.addEventListener("click", handleOnline)

document.addEventListener("keydown", (e) => { keyState[e.key] = true })

document.addEventListener("keyup", (e)=>{ keyState[e.key] = false })

document.addEventListener("mousemove", (e) => {
	if (e.movementY > 1) { keyState["z"] = true ; keyState["a"] = false; }
	else if (e.movementY < -1){ keyState["z"] = false ; keyState["a"] = true; }
	else {keyState["z"] = false; keyState["a"] = false; }
})

function draw() {
	// Score
	const player1Tag = modeAi1?"IA-1":"PLAYER-1"
	const player2Tag = modeAi2?"IA-2":"PLAYER-2"
	if (state.players[1]) score.innerText = `${player1Tag} ${state.players[0].score} | ${player2Tag} ${state.players[1].score}`

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


setInterval(async ()=>
{
	// await refreshLobbylocalList();
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
