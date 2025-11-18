// classes/Lobby.ts
import { timeStamp } from "console"
import { User } from "./User.js"

export class Lobby
{
	private users = new Map<string, User>()

	constructor(public readonly id: string)
	{
		console.log(`🆕 Lobby ${id} created`)
	}

	toJSON()
	{
		return {
			id: this.id,
			users: Array.from(this.users.values()).map(u => ({
			id: u.id,
			pseudo: u.pseudo
			})),
			size: this.size
		};
	}


	addUser(user: User)
	{
		this.users.set(user.id, user)
		console.log(`🆕 ${user.pseudo} join the lobby ${this.id}`)
		this.broadcast(
			{
				type: "system",
				text: `${user.pseudo} join the lobby.`,
				timestamp: Date.now()
			}
		)
	}

	removeUser(userId: string)
	{
		const user = this.users.get(userId)
		if (!user) return
		this.users.delete(userId)
		console.log(`❌ ${user.pseudo} left the lobby ${this.id}`)
		this.broadcast(
			{
				type: "system",
				text: `${user.pseudo} left the lobby.`,
				timestamp: Date.now()
			}
		)
	}

	handleMessage(sender: User, msg: any)
	{
		this.broadcast(
			{
				type: "chat",
				from: sender.pseudo,
				text: msg.text,
				timestamp: Date.now()
			}
			// ,sender.id
		)
	}

	broadcast(payload: any, exceptId?: string)
	{
		for (const [id, user] of this.users.entries())
		{
			if (id !== exceptId) user.send(payload);
		}
	}

	get size()
	{
		return this.users.size;
	}

	close()
	{
		for (const user of this.users.values()) user.close("Lobby closed");
		this.users.clear();
		console.log(`❌ Lobby ${this.id} deleted`);
	}
}
