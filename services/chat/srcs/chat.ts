const clients = new Set<WebSocket>()

type MessageType = {
	type: 'global' | 'mp' | 'auth'
	to?: string
	msg: string
}

type ClientType = { username: string; socket: WebSocket }

const clientsList: Set<ClientType> = new Set<ClientType>()

const server = Bun.serve({
	port: 4444,
	fetch(req, server) {
		if (server.upgrade(req)) {
			return
		}
		return new Response('WebSocket chat server running', {
			status: 200
		})
	},
	websocket: {
		open(ws) {
			clients.add(ws)
			console.log('Client connected')

			ws.send(
				JSON.stringify({
					type: 'system',
					message: 'Welcome to the chat!'
				})
			)
		},
		message(ws, message) {
			const data = JSON.parse(message)

			console.log('New Message: ', data)
			if (data.type === 'auth') {
				clientsList.add({
					socket: ws,
					username: data.username
				})
			} else if (data.type === 'global') {
				for (const client of clients) {
					if (client.readyState === WebSocket.OPEN) {
						client.send(message)
					}
				}
			} else if (data.type === 'mp') {
				let clientFound
				for (let client of clientsList) {
					if (client.username === data.to) {
						console.log('Client: ', client)
						clientFound = client
					}
				}
				if (clientFound) {
					clientFound.socket.send(message)
					ws.send(message)
					console.log(data)
				} else {
					console.log(data)
					data.msg = 'Client not found'
					data.type = 'Error'
					ws.send(JSON.stringify(data))
				}
			}
		},
		close(ws) {
			clients.delete(ws)
			console.log('Client disconnected')
		}
	}
})

console.log(`Chat server running on ws://localhost:${server.port}`)
