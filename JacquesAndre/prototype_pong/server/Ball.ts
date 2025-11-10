export class Ball
{
	x: number;
	y: number;
	defaultX: number;
	defaultY: number;
	vx: number;
	vy: number;

	constructor(x: number, y: number, vx: number, vy: number)
	{
		this.x = x
		this.y = y
		this.defaultX = x
		this.defaultY = y
		this.vx = vx
		this.vy = vy
	}

	reset(scoreLeft: number, scoreRight: number)
	{
		this.x = this.defaultX + this.defaultX * (1.5 - Math.random()) / 5
		this.y = this.defaultY + this.defaultY * (1.5 - Math.random()) / 5
		const maxVx = 5;
		const baseVx = 2;
		const baseVy = 2;
		const diff = Math.abs(scoreLeft - scoreRight);
		const leader = scoreLeft > scoreRight ? 0 : 1;
		const direction = leader === 0 ? -1 : 1;
		const randomVy = Math.random() * baseVy * 2 - baseVy;
		this.vx = Math.min(baseVx * (1 + diff), maxVx) * direction;
		this.vy = randomVy;
	}
}
