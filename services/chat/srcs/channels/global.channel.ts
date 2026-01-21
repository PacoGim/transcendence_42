import { dbPostQuery } from '../services/db.service'
import { clientsSocket } from '../state/clients.state'
import { BunSocketType } from '../types/bunSocket.type'
import { isCurrentClientBlocked } from '../crud/block.crud'

export async function globalChannel(ws: BunSocketType, message: string | Buffer<ArrayBuffer>) {
	const res = await dbPostQuery({
		endpoint: 'dbAll',
		query: {
			verb: 'SELECT',
			sql: 'SELECT blocked_username FROM blocks WHERE blocker_username = ?',
			data: [ws.data.username]
		}
	})
	if (res.status >= 400) {
		console.log('status: ', res.status, 'message: ', res.message)
		return
	}
	const clients = res.data as { blocked_username: string }[]
	console.log('Clients blocked: ', clients)
	for (const client of clientsSocket) {
		if (client.readyState === WebSocket.OPEN && !isCurrentClientBlocked(clients, client.data.username)) {
			client.send(message)
		}
	}
}
