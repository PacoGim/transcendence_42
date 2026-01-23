import { clientsSocket } from '../state/clients.state'
import { BunSocketType } from '../types/bunSocket.type'
import { SocketDataType } from '../types/socketData.type'
import { sendUserList } from '../functions/sendUserList.fn'

export function updateUsername(ws: BunSocketType, data: SocketDataType) {
	const oldUsername = ws.data.username
	ws.data.username = data.msg

	for (const socket of clientsSocket) {
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(
				JSON.stringify({
					type: 'info',
					msg: `User ${oldUsername} changed name to ${data.msg}`
				})
			)
		}
	}
	sendUserList()
}
