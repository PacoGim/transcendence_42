import { clientsSocket } from '../state/clients.state'
import { MessageType } from '../types/message.type'

export function sendUserList() {
	const clients: string[] = []

	clientsSocket.forEach(ws => {
		clients.push(ws.data.username)
	})

	const message: MessageType = {
		msg: JSON.stringify(clients),
		type: 'users'
	}

	clientsSocket.forEach(ws => {
		ws.send(JSON.stringify(message))
		console.log('Client name: ', ws.data.username)
	})
}
