import type { DuelResponse, DuelType, GamePending } from '../../types/message.type.ts'

type DuelStore = DuelResponse | DuelType

export type LobbyDuel = {
	from: string
	status: 'pending'
}


export type LobbyState = {
	gamePendings: GamePending[],
	duels: LobbyDuel[],
	sessionId : string
}

type Subscriber = (state: LobbyState) => void

const state: LobbyState = {
	gamePendings: [],
	duels: [],
	sessionId: ""
}

function createLobbyStore()
{
	const subscribers = new Set<Subscriber>()

	function subscribe(fn: Subscriber)
	{
		subscribers.add(fn)
		fn(state) // 🔥 push initial state
		return () => subscribers.delete(fn)
	}

	function emit()
	{
		for (const fn of subscribers) fn(state)
	}

	function addIncomingDuel(from: string)
	{
		const exists = state.duels.some(d => d.from === from)
		if (exists) return

		state.duels.push({ from, status: 'pending' })
		emit()
	}

	function removeDuel(from: string)
	{
		state.duels = state.duels.filter(d => d.from !== from)
		emit()
	}


	// ---- GAME PENDING ----
	function setGamePendings(games: GamePending[])
	{
		state.gamePendings = games
		emit()
	}

	function refreshSessionId(sessionId: string)
	{
		state.sessionId = sessionId
		emit()
	}

	function clearGamePendings()
	{
		state.gamePendings = []
		emit()
	}

	function getState()
	{
		return state
	}

	return {
		subscribe,
		getState,
		setGamePendings,
		clearGamePendings,
		addIncomingDuel,
		removeDuel,
		refreshSessionId
	}
}

declare global {
	interface Window {
		LobbyStore?: ReturnType<typeof createLobbyStore>
	}
}

export const LobbyStore = (window.LobbyStore ??= createLobbyStore())
