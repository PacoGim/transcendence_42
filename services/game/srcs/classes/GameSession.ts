import { randomUUID, UUID } from "crypto"
import User from "./User.js"
import { RemoteGame } from "./RemoteGame.js"
import { GameManager } from "./GameManager.js"
import { GameInitType } from "../types/message.type.js"

export type SessionState =
	| "waiting"
	| "countdown"
	| "playing"
	| "ended"

export class GameSession
{
public readonly id: UUID
private humans: User[] = []
private spectators: User[] = []

private game?: RemoteGame
private state: SessionState = "waiting"

constructor(
	private readonly gameManager: GameManager,
	private readonly gameInit : GameInitType
)
{
	this.id = randomUUID()
}

addHuman(user: User): boolean
{
	if (this.state !== "waiting") return false
	if (this.humans.includes(user)) return false
	if (this.humans.length >= this.gameInit.humanCount) return false

	this.humans.push(user)
	user.status = "waiting"
	user.navigate = "remote_game"

	this.checkAutoStart()
	return true
}

removeHuman(user: User): boolean
{
	if (this.state !== "waiting") return false

	const index = this.humans.indexOf(user)
	if (index === -1) return false

	this.humans.splice(index, 1)

	user.status = "chat"
	user.navigate = "home"

	return true
}

hasHuman(user: User): boolean
{
	return this.humans.includes(user)
}

addSpectator(user: User)
{
	if (this.spectators.includes(user)) return
	this.spectators.push(user)
}

private checkAutoStart()
{
	if (this.state !== "waiting") return
	if (this.humans.length < this.gameInit.humanCount) return

	this.startGame()
}

private startGame()
{
	this.state = "countdown"

	for (const user of this.humans)
	{
		user.status = "game"
	}

	const users: User[] = [...this.humans]
	for (let i = 0; i < this.gameInit.botCount; i++)
	{
		users.push(new User("", `bot_${i}`))
	}

	this.game = this.gameManager.createGame(users)

	this.state = "playing"
}

onGameEnded()
{
	this.state = "ended"

	for (const user of this.humans)
	{
		user.status = "chat"
		user.navigate = "home"
	}

	this.humans = []
	this.spectators = []
	this.gameManager.removeGame(this.game)
	this.game = undefined
}

isWaiting(): boolean
{
	return this.state === "waiting"
}

getHumanCount(): number
{
	return this.humans.length
}

getPlayerReady()
{
	return (this.humans.length + this.gameInit.botCount)
}

getPlayerMax()
{
	return (this.gameInit.humanCount + this.gameInit.botCount)
}

hasFreeSlot(): boolean
{
	return this.humans.length < this.gameInit.humanCount
}

canJoin(): boolean
{
	return this.state === "waiting" && this.hasFreeSlot()
}


}
