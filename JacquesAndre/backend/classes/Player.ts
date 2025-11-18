import { WebSocket } from "ws";

export class Player
{
	id: number;
	pseudo: string;
	socket?: WebSocket;
	angle: number;
	defaultAngle: number;
	spin: number;
	score: number;
	pause: boolean;
	key: string;
	paddleSize: number;

	constructor(id: number, angle: number, spin: number) {
		this.id = id;
		this.angle = angle;
		this.pseudo = "undefined";
		this.defaultAngle = angle;
		this.spin = spin;
		this.score = 0;
		this.pause = false;
		this.key = "none";
		this.paddleSize = 0.2; // radians (~11.5°)
		this.socket = undefined;
	}

	move(direction: "left" | "right")
	{
		const step = 0.05 * this.spin;
		if (direction === "left") this.angle += step;
		if (direction === "right") this.angle -= step;

		// 🔁 Normalisation dans [-π, π]
		// this.angle = Math.atan2(Math.sin(this.angle), Math.cos(this.angle));

		// ✅ Borne selon le côté
		if (this.id === 1)
		{
			// Joueur gauche : autorisé entre 90° et 270° (π/2 à 3π/2)
			const min = (Math.PI / 2) + this.paddleSize
			const max = 3 * Math.PI / 2 - this.paddleSize
			if (this.angle < min) this.angle = min
			if (this.angle > max) this.angle = max
		}
		else if (this.id === 2)
		{
			// Joueur droit : autorisé entre -90° et +90° (-π/2 à π/2)
			const min = -Math.PI / 2 + this.paddleSize
			const max = Math.PI / 2 - this.paddleSize
			if (this.angle < min) this.angle = min
			if (this.angle > max) this.angle = max
		}
	}

	togglePause()
	{
		this.pause = !this.pause
		// console.log(`⏸️ Joueur ${this.id} pause: ${this.pause}`)
	}

	resetAngle()
	{
		this.angle = this.defaultAngle
	}
}
