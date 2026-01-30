import { json_stringify } from '../functions/json_wrapper.js'
import { KeyType, StatusType } from '../types/message.type.js'
import { BunSocketType } from '../types/bunSocket.type.js'

export default class User
{
	public pseudo: string
	public socket: BunSocketType
	public status: StatusType = 'chat'
	public navigate: string = ""
	public key: KeyType = 'none'
	constructor(public readonly id: string, pseudo: string)
	{
		this.navigate = "remote_game"
		this.pseudo = pseudo
		this.socket = undefined
	}

	send(data: any)
	{
		if (this.isConnected())
		{
			this.socket?.send(json_stringify(data))
		}
	}

	close(reason?: string)
	{
		this.socket?.close(1000, reason)
	}

	isConnected()
	{
		return (this.socket?.readyState === WebSocket.OPEN)
	}

	isOutGame()
	{
		return (!this.isConnected() || this.status != "game")
	}

	toJSON()
	{
		return {
			pseudo: this.pseudo,
			connected: this.isConnected(),
			status: this.status
		}
	}
}
