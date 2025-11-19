import { WebSocket } from "ws";
import User from "./User.js"

export class Player
{
	readonly index: number
	readonly nbPlayer : number
	readonly paddleSize: number
	readonly defaultAngle: number
	readonly minAngle: number
	readonly maxAngle: number
	readonly user: User
	angle: number
	score: number
	pause: boolean
	key: string

	constructor(index: number, nbPlayer: number, user: User)
	{
		this.index = index
		this.nbPlayer = nbPlayer
		this.paddleSize = 0.2 // radians (~11.5°)
		this.user = user
		this.key = "none"
		this.pause = false
		this.score = 5
		this.angle = (Math.PI + 2 * index * Math.PI / nbPlayer) % (2 * Math.PI)
		this.defaultAngle = (Math.PI + 2 * index * Math.PI / nbPlayer) % (2 * Math.PI)
		this.minAngle = ((Math.PI / 2) + (2 * this.index * Math.PI / this.nbPlayer) + this.paddleSize)
		this.maxAngle = ((Math.PI / 2) + (2 * (this.index + 1) * Math.PI / this.nbPlayer) - this.paddleSize)
		console.log(`created player${index} angle ${this.angle} min ${this.minAngle} max ${this.maxAngle}`)
		user.status = "game"
	}

	move(direction: "-" | "+")
	{
		if (direction === "-") this.angle += 0.05
		if (direction === "+") this.angle -= 0.05

		if (this.angle < this.minAngle) this.angle = this.minAngle
		if (this.angle > this.maxAngle) this.angle = this.maxAngle

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
