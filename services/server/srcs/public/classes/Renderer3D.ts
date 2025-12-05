import { arena, board } from "../functions/game.scale.js"
import type { GameState } from "../../types/game.type.js"
// import * as BABYLON from "babylonjs"

type Mesh3D = {
	ballMesh: BABYLON.Mesh | null,
	paddleMeshes: BABYLON.Mesh[],
	backgroundArcs: BABYLON.Mesh[]
}

export class Renderer3D
{
private mesh3D : Mesh3D = {ballMesh:null, paddleMeshes:[], backgroundArcs:[]}
private color: any
private worldScale = 0.08
private canvas: HTMLCanvasElement
private engine: BABYLON.Engine
private scene: BABYLON.Scene
private paused: boolean = false
private getState: () => GameState | null
private getAnglePlayer: () => number
private getEnd: () => boolean

constructor(canvas: HTMLCanvasElement, deps: {
	color: any,
	getState: () => GameState | null,
	getAnglePlayer: () => number,
	getEnd: () => boolean
}) {
	this.color = deps.color
	this.getState = deps.getState
	this.getAnglePlayer = deps.getAnglePlayer
	this.getEnd = deps.getEnd
	this.canvas = canvas

	canvas.width = board.width
	canvas.height = board.height
	canvas.style.position = "fixed"
	canvas.style.top = "10"
	canvas.style.left = "10"
}

pause() { this.paused = true; }

resume() { this.paused = false; }

async start()
{
	await this.initBabylon()
	this.engine.runRenderLoop(()=>this.renderCanvas3D())
}

private renderCanvas3D()
{
	if (this.getEnd())
	{
		console.log("renderCanvas3D stop renderLoop")
		this.engine.stopRenderLoop()
		this.engine.dispose()
		this.scene.dispose()
	}
	else this.scene.render()
} //renderCanvas3D

private async initBabylon()
{
	await import('/lib/babylon.js')
	console.log("BABYLON after import", BABYLON)
	// const engine: BABYLON.Engine = new BABYLON.Engine(canvas, true)
	this.engine = new BABYLON.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true, premultipliedAlpha: true })
	this.scene = new BABYLON.Scene(this.engine)
	this.initScene()
} //initBabylon

private initScene ()
{
	this.canvas.width = 1440
	this.canvas.height = 720
	this.canvas.style.position = "fixed"
	this.canvas.style.top = "0px"
	this.canvas.style.left = "0px"
	const state = this.getState()
	// scene.clearColor = new BABYLON.Color4(0, 0, 0, 1) // noir pur pour style
	this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0)  // transparent
	const camera: BABYLON.FreeCamera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 8, -35), this.scene)
	camera.setTarget(BABYLON.Vector3.Zero())
	camera.fov = 0.8
	camera.attachControl(this.canvas, true)
	camera.fov = (state?.players.length || 3) * 0.3
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
	const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 10, 0), this.scene)
	light.intensity = 2.2
	// ☀️ Soleil lointain
	const sun = new BABYLON.DirectionalLight(
		'sun',
		new BABYLON.Vector3(-0.6, -1, -0.3), // direction du soleil
		this.scene
	)
	sun.intensity = 2.2

	const shadowGen = new BABYLON.ShadowGenerator(2048, sun)
	shadowGen.useExponentialShadowMap = true
	this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2
	this.scene.fogDensity = 0.006
	this.scene.fogColor = new BABYLON.Color3(0.02, 0.02, 0.05)
	this.scene.registerBeforeRender(() => {
		if (!state || this.getEnd()) return
		this.updateBabylonFromState(this.scene)
	})
} //initScene

private createArcMesh(
	id: string,
	centerX: number,
	centerY: number,
	radiusPx: number,
	startAngle: number,
	endAngle: number,
	thicknessPx: number,
	scene: BABYLON.Scene
): BABYLON.Mesh {
	const points: BABYLON.Vector3[] = []
	const steps = Math.max(6, Math.ceil(((endAngle - startAngle) / (Math.PI * 2)) * 64))
	for (let i = 0; i <= steps; i++) {
		const t = startAngle + (endAngle - startAngle) * (i / steps)
		const x = centerX + radiusPx * Math.cos(t)
		const y = centerY + radiusPx * Math.sin(t)
		// map to world coords: X -> x-world, Z -> y-world (inverted so canvas up ~ -Z)
		const vx = (x - arena.centerX) * this.worldScale
		const vz = (y - arena.centerY) * this.worldScale * -1
		points.push(new BABYLON.Vector3(vx, 0.5, vz))
	}
	// Create tube along arc and give it thickness
	const radiusWorld = Math.max(0.01, thicknessPx * this.worldScale * 0.5)
	const tube = BABYLON.MeshBuilder.CreateTube(id, { path: points, radius: radiusWorld, updatable: true }, scene)
	return tube
} //createArcMesh

private initBabylonVisuals(scene: BABYLON.Scene)
{
	const mesh3D = this.mesh3D
	const angle = this.getAnglePlayer()
	const state = this.getState()
	if (!mesh3D.ballMesh) {
		mesh3D.ballMesh = BABYLON.MeshBuilder.CreateSphere('ball3d', { diameter: Math.max(0.2, board.ballSize * this.worldScale * 1.5) }, scene)
		const mat = new BABYLON.StandardMaterial('ballMat', scene)
		// mat.diffuseColor = this.hexToColor3(this.color.colorBall)
		mat.diffuseColor = BABYLON.Color3.FromHexString(this.color.colorBall)
		mesh3D.ballMesh.material = mat
	}
	mesh3D.paddleMeshes.forEach(m => m.dispose(true, true))
	mesh3D.backgroundArcs.forEach(m => m.dispose(true, true))
	mesh3D.paddleMeshes = []
	mesh3D.backgroundArcs = []

	const centerX = arena.centerX
	const centerY = arena.centerY
	const radius = arena.radius
	const paddleWidth = board.paddleWidth * 1.5

	if (!state?.players) return

	state.players.forEach((p: any, i: number) => {
		const base = BABYLON.Color3.FromHexString(this.color.player[i])
		const matPad = this.makePaddleMaterial(scene, base)
		const matBG = this.makeBackgroundMaterial(scene, base)

		const aStart = p.angle - p.paddleSize + angle
		const aEnd = p.angle + p.paddleSize + angle

		// BACKGROUND — 2 zones
		const bg1 = this.createArcMesh(
			`bg1_${i}`,
			centerX,
			centerY,
			radius + paddleWidth / 2,
			p.minAngle + angle,
			aStart,
			paddleWidth,
			scene
		)
		const bg2 = this.createArcMesh(
			`bg2_${i}`,
			centerX,
			centerY,
			radius + paddleWidth / 2,
			aEnd,
			p.maxAngle + angle,
			paddleWidth,
			scene
		)
		bg1.material = bg2.material = matBG

		mesh3D.backgroundArcs.push(bg1, bg2)

		// PADDLE glossy
		const pad = this.createArcMesh(`pad_${i}`, centerX, centerY, radius + paddleWidth / 2, aStart, aEnd, paddleWidth, scene)
		pad.material = matPad
		mesh3D.paddleMeshes.push(pad)
	})
} //initBabylonVisuals

private updateBabylonFromState(scene: BABYLON.Scene)
{
	const mesh3D = this.mesh3D
	const angle = this.getAnglePlayer()
	const state = this.getState()
	if (!state || !state.ball) return
	if (!mesh3D.ballMesh) this.initBabylonVisuals(scene)

	// compute canvas coords of ball as in 2D draw
	const ballX = arena.centerX + state.ball.dist * Math.cos(state.ball.theta + angle)
	const ballY = arena.centerY + state.ball.dist * Math.sin(state.ball.theta + angle)

	// map to world coordinates
	const wx = (ballX - arena.centerX) * this.worldScale
	const wz = (ballY - arena.centerY) * this.worldScale * -1
	if (mesh3D.ballMesh) {
		mesh3D.ballMesh.position.x = wx
		mesh3D.ballMesh.position.z = wz
		mesh3D.ballMesh.position.y = 0.5 // hauteur fixe
	}
	this.initBabylonVisuals(scene)
} //updateBabylonFromState

private makePaddleMaterial(scene: BABYLON.Scene, color: BABYLON.Color3) {
	const mat = new BABYLON.StandardMaterial('padMat', scene)
	mat.diffuseColor = color
	return mat
} //makePaddleMaterial

private makeBackgroundMaterial(scene: BABYLON.Scene, paddleColor: BABYLON.Color3) {
	const bg = new BABYLON.StandardMaterial('bgMat', scene)
	bg.diffuseColor = paddleColor.scale(0.1)
	bg.specularColor = new BABYLON.Color3(0, 0, 0) // pas de brillance
	bg.roughness = 1 // mat max
	return bg
} //makeBackgroundMaterial


}
