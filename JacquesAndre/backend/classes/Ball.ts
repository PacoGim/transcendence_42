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

	reset(defaultAngle: number)
	{
		this.x = this.defaultX + this.defaultX * (1.5 - Math.random()) / 5
		this.y = this.defaultY + this.defaultY * (1.5 - Math.random()) / 5
		const minV = 2;
		const maxV = 4;
		const randomV = minV + Math.random() * (maxV - minV);
		this.vx = randomV *  Math.cos(defaultAngle)
		this.vy = randomV * Math.sin(defaultAngle)
	}
}
