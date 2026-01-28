import Lobby from "../classes/Lobby.js"
import User from "../classes/User.js"
import { BunSocketType } from "../types/bunSocket.type.js"
import { json_stringify } from "../functions/json_wrapper.js"
import { JoinGameType } from "../types/message.type.js"

export function listGamesChannel(ws: BunSocketType, lobby: Lobby)
{
	ws.send(json_stringify({
		type: "list-game",
		games: lobby.gameManager.getJoinableSessionsInfo()
	}))
}

export function joinGameChannel(
	ws: BunSocketType,
	data: JoinGameType,
	lobby: Lobby
)
{
	const user: User = ws.data.user
	const session = lobby.gameManager.getSessionById(data.sessionId)

	console.log(`${user.pseudo} try join ${data.sessionId}`)

	if (!session)
	{
		return ws.send(json_stringify({
			type: "error",
			text: "Game session not found"
		}))
	}

	if (session.hasHuman(user))
	{
		return ws.send(json_stringify({
			type: "error",
			text: "You've already join this game"
		}))
	}

	if (!session.canJoin())
	{
		return ws.send(json_stringify({
			type: "error",
			text: "Game session is not joinable"
		}))
	}

	session.addHuman(user)

	ws.send(json_stringify({type: "session-id", sessionId: session.id}));

	lobby.broadcast({
		type: "list-game",
		games: lobby.gameManager.getJoinableSessionsInfo()
	})
}
