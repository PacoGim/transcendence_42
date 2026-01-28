import Lobby from '../classes/Lobby.js'
import User from '../classes/User.js'
import { json_stringify } from '../functions/json_wrapper.js'
import { BunSocketType } from '../types/bunSocket.type'
import { CreateGameType } from '../types/message.type.js'

export function createGameChannel(ws: BunSocketType, data: CreateGameType, lobby : Lobby)
{

	const currentUser : User = ws.data.user;
	if (!currentUser) return;
	const existingSession = lobby.gameManager.getSessionByUser(currentUser);
	if (existingSession && existingSession.isWaiting())
	{
		return ws.send(json_stringify({
			type: "error",
			text: "You are already waiting in another game"
		}))
	}
	const { humanCount, botCount } = data.game
	const maxPlayer = botCount + humanCount
	if (maxPlayer < 2 || maxPlayer > 8)
		return ws.send(json_stringify({type: "error",text: `Too many or too few players`}))

	console.log(`${ws.data.username} create game: `, data.game);
	const session = lobby.gameManager.createSession({humanCount, botCount})

	session.addHuman(currentUser)

	ws.send(json_stringify({type: "session-id", sessionId: session.id}));

	lobby.broadcast({
		type: "list-game",
		games: lobby.gameManager.getJoinableSessionsInfo()
	})
}
