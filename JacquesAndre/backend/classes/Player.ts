import { WebSocket } from "ws"

import User from "./User.js"
import { arena } from "./board.js";

export class Player
{
	readonly index: number
	readonly nbPlayer : number
	readonly defaultAngle: number
	readonly minAngle: number
	readonly maxAngle: number
	readonly user: User
	paddleSize: number
	angle: number
	score: number
	pause: boolean
	pseudo: string
	key: string
	tick: number

	constructor(index: number, nbPlayer: number, user: User)
	{
		this.index = index
		this.nbPlayer = nbPlayer
		this.paddleSize = 0.3 * Math.PI / nbPlayer
		// if (index > 0) this.paddleSize = Math.PI / (nbPlayer)
		this.user = user
		this.key = "none"
		this.pause = false
		this.score = 10
		this.pseudo = user.pseudo
		this.tick = 0
		// pré-calculs communs
		const twoPiOverPlayers = (2 * Math.PI) / this.nbPlayer

		// min, max et angle par défaut
		this.minAngle = this.index * twoPiOverPlayers
		this.maxAngle = (this.index + 1) * twoPiOverPlayers
		this.defaultAngle = this.minAngle + (twoPiOverPlayers / 2)

		// this.minAngle = (Math.PI / 2) + (2 * this.index * Math.PI / this.nbPlayer)
		// this.maxAngle = (Math.PI / 2) + (2 * (this.index + 1) * Math.PI / this.nbPlayer)
		// this.defaultAngle = (this.minAngle + this.maxAngle) / 2

		this.angle = this.defaultAngle
		console.log(`created player${index} angle ${this.angle} min ${this.minAngle} max ${this.maxAngle}`)
		user.status = "game"
	}


	handleIA(ballIA:{x:number, y:number, vx:number, vy:number})
	{
		this.pseudo = "🤖" + this.user.pseudo
		this.tick = (this.tick + 1) % 6
		const dx = ballIA.x + this.tick * ballIA.vx - arena.centerX;
		const dy = ballIA.y + this.tick * ballIA.vy - arena.centerY;
		// const dist = Math.sqrt(dx * dx + dy * dy);
		let theta = Math.atan2(dy, dx);
		if (theta < 0) theta += 2 * Math.PI;
		if (this.angle > theta + this.paddleSize) this.angle -= 0.05
		if (this.angle < theta - this.paddleSize) this.angle += 0.05
		if (this.angle - this.paddleSize < this.minAngle) this.angle = this.minAngle + this.paddleSize
		if (this.angle + this.paddleSize > this.maxAngle) this.angle = this.maxAngle - this.paddleSize
	}

	handleKey(ballIA:{x:number, y:number, vx:number, vy:number})
	{
		this.pseudo = this.user.pseudo
		if (!this.user.socket || this.key === "chatGPT") return this.handleIA(ballIA)
		if (this.key === "none") return
		if (this.key === "space") return this.togglePause()
		if (this.user.socket && this.user.socket.readyState !== WebSocket.OPEN) return this.togglePause()
		if (this.key === "-") this.angle += 0.05
		else if (this.key === "+") this.angle -= 0.05

		if (this.angle - this.paddleSize < this.minAngle) this.angle = this.minAngle + this.paddleSize
		if (this.angle + this.paddleSize > this.maxAngle) this.angle = this.maxAngle - this.paddleSize
		this.key = "none"
	}

	togglePause()
	{
		this.pause = !this.pause
		if (this.pause) console.log(`⏸️ Joueur ${this.user.pseudo} toggle pause`)
	}

	resetAngle()
	{
		this.angle = this.defaultAngle
	}
}
