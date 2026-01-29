import Lobby from '../classes/Lobby.js'
import { json_stringify } from '../functions/json_wrapper.js'
import { BunSocketType } from '../types/bunSocket.type'
import { AuthType } from '../types/message.type.js'

export function authChannel(ws: BunSocketType, data: AuthType, lobby : Lobby)
{
	ws.data.username = data.username
	const user = lobby.createUser(data.username)
	user.socket = ws
	ws.data.user = user
	user.send({
		type: "list-game",
		games: lobby.gameManager.getJoinableSessionsInfo()
	})
}
