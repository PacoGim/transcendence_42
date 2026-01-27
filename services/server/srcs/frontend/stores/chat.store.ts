import { type MessageType } from '../../types/chat.type'
import { UserStore } from './user.store'
import { NotificationStore } from './notification.store'

type Subscriber = (message: MessageType[]) => void

let ws: WebSocket | null = null

const chats: MessageType[] = []

function createChatStore() {
	const subscribers = new Set<Subscriber>()

	function subscribe(fn: Subscriber) {
		subscribers.add(fn)
		return () => subscribers.delete(fn)
	}

	function emit(chat: MessageType[]) {
		for (const fn of subscribers) fn(chat)
	}

	function send(message: MessageType) {
		if (ws === null) return
		ws.send(JSON.stringify(message))
	}

	function addWebsocket(username: string) {
		if (ws !== null) return
		ws = new WebSocket(`wss://${location.host}/chatws`)
		ws.addEventListener('open', () => {
			if (ws === null) return
			ws.send(
				JSON.stringify({
					type: 'auth',
					username
				})
			)
		})
		ws.onmessage = event => {
			const msg = JSON.parse(event.data)
			if (msg.type === 'system') return
			if (msg.type === 'req-friend') {
				console.log(event.data)
				return
			}
			if (msg.type === 'notification') {
				NotificationStore.notify(msg.msg, 'INFO')
				return
			}
			chats.push(msg)
			ChatStore.emit(chats)
		}
		ws.onclose = event => {
			console.log(event)
		}
	}

	function removeWebsocket() {
		ws?.close()
		ws = null
	}

	function getChats() {
		return chats
	}

	return { subscribe, emit, send, getChats, addWebsocket, removeWebsocket }
}

declare global {
	interface Window {
		ChatStore?: ReturnType<typeof createChatStore>
	}
}

export const ChatStore = (window.ChatStore ??= createChatStore())
