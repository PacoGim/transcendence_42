import { navigate } from "../js/routing"
import { ChatStore } from "../stores/chat.store"
import { GameStore } from "../stores/game.store"
import { LobbyStore } from "../stores/lobby.store"
import { UserStore } from "../stores/user.store"

export function clearUserState()
{
	ChatStore.removeWebsocket()
	GameStore.removeWebGameSocket()
	UserStore.clear()
	LobbyStore.refreshSessionId("")
	navigate('')
}

export async function handleLogout()
{
	await fetch('/logout', {
		method: 'POST',
		credentials: 'include'
	})
	clearUserState();
}
