import { Player } from "./Player.ts"
import User from "./User.ts"

export default class Game2P
{
	playerLeft : User;
	playerRight : User;


	constructor(left: User, right: User)
	{
		this.playerLeft = left
		this.playerRight = right
		this.playerLeft.status = "game"
		this.playerRight.status = "game"

	}
}
