import { json_stringify } from "../../../shared/json_wrapper.ts"
import {board, arena } from "../../../shared/board.ts"
import { color, toggleColor } from "./pickerColor.ts"
import type { Impact } from "../../../backend/classes/Ball.ts"
import * as BABYLON from 'babylonjs'

/**
 * Version complète : draw 2D existant + visualisation BabylonJS
 *
 * - conserve ton canvas 2D et draw()
 * - ajoute initBabylonVisuals() qui crée les meshes Babylon et les met à jour
 *
 * Notes :
 * - On mappe les coordonnées canvas X/Y sur l'axe X (horizontal) et Z (profondeur) de Babylon.
 * - Y dans Babylon est l'axe vertical (on garde la scène à Y = 0.5 pour la visibilité).
 */

// ---------- DOM / canvas 2D (ton code existant) ----------
const score = document.getElementById("score")
const gameContainer = document.getElementById("game-container")
const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")
canvas.width = board.width
canvas.height = board.height
gameContainer?.appendChild(canvas);
let camera : BABYLON.FreeCamera

const babylonCanvas  = document.getElementById("babylonCanvas") as HTMLCanvasElement // Get the canvas element
const engine : BABYLON.Engine = new BABYLON.Engine(babylonCanvas, true); // Generate the BABYLON 3D engine
const createScene = function (engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
	// default playground scene
	const scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color4(0,0,0,1); // noir pur pour style

	// simple camera
	camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 8, -35), scene);
	camera.setTarget(BABYLON.Vector3.Zero());
	camera.fov = 0.8
	camera.attachControl(canvas, true);
    // 📌 Camera grand angle + contre-plongée
    // const camera = new BABYLON.ArcRotateCamera(
    //     "cam",
    //     -Math.PI / 2,         // rotation horizontale
    //     Math.PI / 2.8,        // inclinaison — baisse la caméra vers le bas
    //     100,                   // distance
    //     new BABYLON.Vector3(0, 0, 0),
    //     scene
    // );

    // camera.fov = 0.8;          // grand angle (0.8 à 1.1 recommandé)
    // camera.lowerBetaLimit = -2.2;
    // camera.upperBetaLimit = 2.2;
    // camera.attachControl(canvas, true);

	// simple light
	const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 10, 0), scene);
	light.intensity = 2.2;
    // ☀️ Soleil lointain
    const sun = new BABYLON.DirectionalLight(
        "sun",
        new BABYLON.Vector3(-0.6, -1, -0.3), // direction du soleil
        scene
    );
    sun.intensity = 2.2;

    // ombres si un jour tu veux un sol/un décor
    const shadowGen = new BABYLON.ShadowGenerator(2048, sun);
    shadowGen.useExponentialShadowMap = true;

    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.006;
    scene.fogColor = new BABYLON.Color3(0.02,0.02,0.05);

	// simple ground (optionnel, juste pour repère)
	// const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 2000, height: 2000 }, scene);
	// const groundMat = new BABYLON.StandardMaterial("gMat", scene);
	// groundMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.05);
	// ground.material = groundMat;
	// ground.position.y = -0.5;

	return scene;
};
const scene : BABYLON.Scene = createScene(engine, babylonCanvas)

const run = function()
{
    engine.runRenderLoop(() => {
        scene.render();
    });
}
run()

// ---------- game state + input (ton code) ----------
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

const debug = document.getElementById("debug")

function start()
{
	draw()
	// lance la boucle d'inputs côté réseau
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

// ---------- helper / util ----------

interface Point { x:number, y:number }

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

function drawLine(ctx: CanvasRenderingContext2D, p1: Point, p2: Point, colorStrike: string = 'black', width: number = 1) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = colorStrike;
    ctx.lineWidth = width;
    ctx.stroke();
}

function drawPredictionsRotated(
    ctx: CanvasRenderingContext2D,
    ball: Point,
    impacts: Impact[],
    center: Point,
    angle: number
) {
    if (!impacts || impacts.length === 0) return;
    let prev = rotatePoint(ball, center.x, center.y, angle);
    for (let i = 0; i < impacts.length; i++) {
        const next = rotatePoint({ x: impacts[i].impactX, y: impacts[i].impactY }, center.x, center.y, angle);
        drawLine(ctx, prev, next, 'yellow', 2);
        prev = next;
    }
}

// ---------- formatScore / initAnglePlayer (ton code) ----------
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

// ---------- 2D draw (ton code) ----------
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
}

// ---------- BabylonJS visuals (nouveau) ----------

/**
 * Helpers pour Babylon colors (accepte "#rrggbb" ou "rgb(...)" approximatif)
 */
function hexToColor3(hex: string): BABYLON.Color3 {
    if (!hex) return new BABYLON.Color3(1,1,1)
    // #RRGGBB
    if (hex[0] === '#') {
        const r = parseInt(hex.slice(1,3),16)/255
        const g = parseInt(hex.slice(3,5),16)/255
        const b = parseInt(hex.slice(5,7),16)/255
        return new BABYLON.Color3(r,g,b)
    }
    // rgb(r,g,b)
    const m = hex.match(/(\d+)[^\d]+(\d+)[^\d]+(\d+)/)
    if (m) return new BABYLON.Color3(parseInt(m[1])/255, parseInt(m[2])/255, parseInt(m[3])/255)
    return new BABYLON.Color3(1,1,1)
}

// Mapping canvas coords -> babylon coords:
// canvas origin (0,0) top-left; arena.centerX/centerY are in canvas coordinates.
// We'll map canvas X -> babylon X (centered), canvas Y -> babylon Z (inverted so up in canvas -> -Z),
// and keep Y (height) small (0.5).
const worldScale = 0.08 // ajuste l'échelle (px -> world units); diminue si objets trop gros

let ballMesh: BABYLON.Mesh | null = null
let paddleMeshes: BABYLON.Mesh[] = []
let backgroundArcs: BABYLON.Mesh[] = []
// let predictionLines: BABYLON.LinesMesh | null = null

/**
 * Crée une tubeline suivant un arc circonférentiel (pour représenter un paddle partiel)
 * - center canvas coords sont en pixels -> on convertit via worldScale
 */
function createArcMesh(id: string, centerX: number, centerY: number, radiusPx: number, startAngle:number, endAngle:number, thicknessPx:number, scene: BABYLON.Scene) : BABYLON.Mesh {
    const points: BABYLON.Vector3[] = []
    const steps = Math.max(6, Math.ceil((endAngle - startAngle) / (Math.PI*2) * 64))
    for (let i = 0; i <= steps; i++) {
        const t = startAngle + (endAngle - startAngle) * (i/steps)
        const x = centerX + radiusPx * Math.cos(t)
        const y = centerY + radiusPx * Math.sin(t)
        // map to world coords: X -> x-world, Z -> y-world (inverted so canvas up ~ -Z)
        const vx = (x - arena.centerX) * worldScale
        const vz = (y - arena.centerY) * worldScale * -1
        points.push(new BABYLON.Vector3(vx, 0.5, vz))
    }
    // Create tube along arc and give it thickness
    const radiusWorld = Math.max(0.01, thicknessPx * worldScale * 0.5)
    const tube = BABYLON.MeshBuilder.CreateTube(id, {path: points, radius: radiusWorld, updatable: true}, scene)
    return tube
}

/**
 * Initialise les objets Babylon (appelé une fois)
 */
function initBabylonVisuals() {
    // balle
    if (!ballMesh) {
        ballMesh = BABYLON.MeshBuilder.CreateSphere("ball3d", {diameter: Math.max(0.2, board.ballSize * worldScale)}, scene)
        const mat = new BABYLON.StandardMaterial("ballMat", scene)
        mat.diffuseColor = hexToColor3(color.colorBall)
        ballMesh.material = mat
    }

    // paddles (one per player)
    // clear existing
    paddleMeshes.forEach(m => m.dispose(true, true))
    backgroundArcs.forEach(m => m.dispose(true, true))
    paddleMeshes = []
    backgroundArcs = []

    const centerX = arena.centerX
    const centerY = arena.centerY
    const radius = arena.radius
    const paddleWidth = board.paddleWidth

    if (!state.players) return

	state.players.forEach((p:any,i:number)=>{

		const base = BABYLON.Color3.FromHexString(color.player[i])
		const matPad = makePaddleMaterial(scene, base)
		const matBG  = makeBackgroundMaterial(scene, base)

		const aStart = p.angle - p.paddleSize + anglePlayer
		const aEnd   = p.angle + p.paddleSize + anglePlayer

		// BACKGROUND — 2 zones
		const bg1 = createArcMesh(`bg1_${i}`,centerX,centerY,radius+paddleWidth/2,
								p.minAngle+anglePlayer,aStart,paddleWidth,scene)
		const bg2 = createArcMesh(`bg2_${i}`,centerX,centerY,radius+paddleWidth/2,
								aEnd,p.maxAngle+anglePlayer,paddleWidth,scene)
		bg1.material = bg2.material = matBG

		backgroundArcs.push(bg1,bg2)

		// PADDLE glossy
		const pad = createArcMesh(`pad_${i}`,centerX,centerY,radius+paddleWidth/2,
								aStart,aEnd,paddleWidth,scene)
		pad.material = matPad
		paddleMeshes.push(pad)
	})

}

/**
 * Met à jour la position de la balle et redessine les prédictions en Babylon
 */
function updateBabylonFromState() {
    if (!state || !state.ball) return
    if (!ballMesh) initBabylonVisuals()

    // compute canvas coords of ball as in 2D draw
    const ballX = arena.centerX + state.ball.dist * Math.cos(state.ball.theta + anglePlayer)
    const ballY = arena.centerY + state.ball.dist * Math.sin(state.ball.theta + anglePlayer)

    // map to world coordinates
    const wx = (ballX - arena.centerX) * worldScale
    const wz = (ballY - arena.centerY) * worldScale * -1
    if (ballMesh) {
        ballMesh.position.x = wx
        ballMesh.position.z = wz
        ballMesh.position.y = 0.5 // hauteur fixe
    }

    // paddles : on recrée les arcs si le nombre de joueurs change ou si angles ont changé beaucoup.
    // ici on met à jour en recréant pour simplicité.
    // For perf: detect changes and only update affected paddles.
    initBabylonVisuals()

    // predictions -> lines
    // if (predictionLines) {
    //     predictionLines.dispose()
    //     predictionLines = null
    // }
    // if (state.impacts && state.impacts.length > 0) {
    //     const points: BABYLON.Vector3[] = []
    //     const start = { x: ballX, y: ballY }
    //     points.push(new BABYLON.Vector3((start.x - arena.centerX)*worldScale, 0.51, (start.y - arena.centerY)*worldScale * -1))
    //     for (let i = 0; i < state.impacts.length; i++) {
    //         const im : any = state.impacts[i]
    //         points.push(new BABYLON.Vector3((im.impactX - arena.centerX)*worldScale, 0.51, (im.impactY - arena.centerY)*worldScale * -1))
    //     }
    //     predictionLines = BABYLON.MeshBuilder.CreateLines("predLines", {points, updatable: false}, scene)
    //     predictionLines.color = new BABYLON.Color3(1,1,0) // yellow
    // }

    // update ball material color if changed
    if (ballMesh && ballMesh.material) {
        const m = ballMesh.material as BABYLON.StandardMaterial
        m.diffuseColor = hexToColor3(color.colorBall)
    }
}

// Register update loop in Babylon
scene.registerBeforeRender(() => {
    if (!state || end) return;

    // 0 -> 1 selon la distance du centre

	// const r1 = state.ball.dist;
	// const r2 = arena.radius;

	// const dTheta = state.ball.theta - anglePlayer;
	// const dist = Math.sqrt(r1*r1 + r2*r2 - 2*r1*r2*Math.cos(dTheta));

    // const ratio = Math.min(1, 0.5 * dist / arena.radius);

    // // smoothstep: transition plus douce et cinématique
    // const smooth = ratio //* ratio * (3 - 2 * ratio);

    // const minFov = 0.8;
    // const maxFov = 0.5 * state.players.length; // modifiable pour plus de "fisheye"

    camera.fov = state.players.length * 0.3

    updateBabylonFromState();
});


// initialise tout de suite (créera des meshes vides tant que state.players n'est pas encore fourni)
initBabylonVisuals()

// ---------- intégration avec toggleColor change (si user change la couleur) ----------
/**
 * Si ta fonction toggleColor modifie color.* on réapplique aux matériaux Babylon
 * (on peut lier ça à un watcher, ici on utilise une fonction simple : appelle updateMaterialsWhenColorsChange()
 * chaque fois que state.changeColor est true dans la boucle draw).
 */
// function updateMaterialsWhenColorsChange() {
//     if (ballMesh && ballMesh.material) (ballMesh.material as BABYLON.StandardMaterial).diffuseColor = hexToColor3(color.colorBall)
//     paddleMeshes.forEach((m, i) => {
//         if (m.material) (m.material as BABYLON.StandardMaterial).diffuseColor = hexToColor3(color.player[i])
//     })
//     backgroundArcs.forEach((m, i) => {
//         if (m.material) (m.material as BABYLON.StandardMaterial).diffuseColor = hexToColor3(color.playerComp[i])
//     })
// }

// Appel depuis draw() : on adaptera un peu la logique pour Babylon
// Dans draw(), juste après toggleColor(), appelle updateMaterialsWhenColorsChange()
// const originalToggleHook = toggleColor // si toggleColor est fonction mutative on laisse
// Note: draw() appelle toggleColor déjà -> on met à jour les materials au moment du changement :
// const originalDraw = draw
// On ne remplace draw, mais on s'assure d'appeler updateMaterialsWhenColorsChange quand state.changeColor
// Ceci a été pris en compte dans la boucle principale draw() ci-dessus : state.changeColor est testé.
// Pour sûreté, on ajoute un petit watcher minimal :
// setInterval(()=> {
//     if (state && state.changeColor) {
//         updateMaterialsWhenColorsChange()
//         // ne pas remettre à false ici car toggleColor() existent déjà ; laisse la logique principale
//     }
// }, 200)

// ---------- fin du fichier ----------

function makeBackgroundColor(base:BABYLON.Color3, factor=0.45){
    return base.scale(factor); // plus sombre = bonne lisibilité
}

function makePaddleMaterial(scene:BABYLON.Scene, color:BABYLON.Color3){
    const mat = new BABYLON.StandardMaterial("padMat",scene)
    mat.diffuseColor  = color
    // mat.specularColor = new BABYLON.Color3(1,1,1)
    // mat.specularPower = 128 // haute brillance

    // // Fresnel = lumiere sur bords/angles
    // const fresnel = new BABYLON.FresnelParameters()
    // fresnel.isEnabled = true
    // fresnel.leftColor  = new BABYLON.Color3(1,1,1)
    // fresnel.rightColor = color.scale(0.5)
    // fresnel.power = 3.5
    // mat.emissiveFresnelParameters = fresnel

    return mat
}

function makeBackgroundMaterial(scene:BABYLON.Scene, paddleColor:BABYLON.Color3){
    const bg = new BABYLON.StandardMaterial("bgMat",scene)
    bg.diffuseColor   = makeBackgroundColor(paddleColor,0.1)
    bg.specularColor  = new BABYLON.Color3(0,0,0) // pas de brillance
    bg.roughness      = 1                        // mat max
    return bg
}
