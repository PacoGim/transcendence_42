import Lobby from "../classes/Lobby.js"
import User from "../classes/User.js"
import { BunSocketType } from "../types/bunSocket.type.js"
import { json_stringify } from "../functions/json_wrapper.js"
import { LeaveGameType } from "../types/message.type.js"

export function leaveGameChannel(
	ws: BunSocketType,
	_data: LeaveGameType,
	lobby: Lobby
)
{
	const user: User = ws.data.user

	lobby.gameManager.leaveSession(user)
	ws.send(json_stringify({type: "session-id", sessionId: ""}));

	lobby.broadcast({
		type: "list-game",
		games: lobby.gameManager.getJoinableSessionsInfo()
	})
}
