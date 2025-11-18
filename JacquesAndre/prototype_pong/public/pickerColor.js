const picker1 = document.getElementById("colorPickerPlayer1")
const picker2 = document.getElementById("colorPickerPlayer2")
const pickerBall = document.getElementById("colorPickerBall")

let color1 = "#00FF00"
let color2 = "#FF0000"
let colorBall = "#FFFF00"
let color1Comp =  "#FF00FF"
let color2Comp = "#00FFFF"
let colorBallComp = "#0000FF"

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

export const color =
{
	color1, color1Comp, color2, color2Comp, colorBall, colorBallComp, toggleColor
}
