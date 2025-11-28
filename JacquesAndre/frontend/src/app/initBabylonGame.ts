import * as BABYLON from "babylonjs"
import { board, arena } from "./board.ts"
import { color } from "./pickerColor.ts"

export function initBabylonGame(state:any, canvas:HTMLCanvasElement, score:any, anglePlayer:any){

    const engine = new BABYLON.Engine(canvas,true)
    const scene  = new BABYLON.Scene(engine)

    /* ------------------ CAMERA + LIGHT ------------------- */
    const camera = new BABYLON.ArcRotateCamera(
        "cam", Math.PI/2,Math.PI/2.2, arena.radius*3,
        new BABYLON.Vector3(0,0,0), scene
    )
    camera.attachControl(canvas,true)

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0,1,0), scene)
	light.intensity = 2.5;

    /* --------------------- BALL ---------------------- */
    const ballMesh = BABYLON.MeshBuilder.CreateSphere("ball",{diameter:board.ballSize},scene)
    const ballMat  = new BABYLON.StandardMaterial("ballMat",scene)
    ballMat.diffuseColor = BABYLON.Color3.FromHexString(color.colorBall)
    ballMesh.material = ballMat

    /* --------------------- PADDLES ---------------------- */
    const paddles = state.players.map((p:any,i:number)=>{
        const pad = BABYLON.MeshBuilder.CreateTorus(`pad${i}`,{
            diameter: arena.radius*2,
            thickness: board.paddleWidth,
            tessellation: 80
        },scene)
        const mat = new BABYLON.StandardMaterial(`pMat${i}`,scene)
        mat.diffuseColor = BABYLON.Color3.FromHexString(color.player[i])
        pad.material = mat
        return pad
    })

    /* 🔥 PREDICTIONS — 1 seul mesh, jamais recréé */
    const predictionLines = BABYLON.MeshBuilder.CreateLines("pred",{points:[new BABYLON.Vector3(0,0,0)]},scene)
    predictionLines.color = new BABYLON.Color3(1,1,0)
    predictionLines.alwaysSelectAsActiveMesh = true

    function updatePredictionMesh(ball:any,impacts:any){

        const newPts = [
            new BABYLON.Vector3(ball.x,ball.y,0),
            ...impacts.map((i:any) => new BABYLON.Vector3(i.impactX,i.impactY,0))
        ]

        predictionLines.updateMeshPositions(positions=>{
            for(let i=0;i<newPts.length;i++){
                positions[i*3]   = newPts[i].x
                positions[i*3+1] = newPts[i].y
                positions[i*3+2] = 0
            }
        })
    }

    /* ------------------ RENDER LOOP ---------------------- */

    scene.onBeforeRenderObservable.add(()=>{

        const bx = arena.centerX + state.ball.dist*Math.cos(state.ball.theta+anglePlayer)
        const by = arena.centerY + state.ball.dist*Math.sin(state.ball.theta+anglePlayer)
        ballMesh.position.set(bx,by,0)

        state.players.forEach((p:any,i:number)=> paddles[i].rotation.z = -(p.angle+anglePlayer))

        if(state.impacts?.length)
            updatePredictionMesh(state.ball,state.impacts)

        score!.innerHTML = formatScore(state.players)
    })

    engine.runRenderLoop(()=>scene.render())
}

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
