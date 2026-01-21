import { blockUser, deblockUser, isDoubleBlock } from '../crud/block.crud'
import { removeFromFriendships } from '../crud/friend.crud'
import { removeFromFriendRequests } from '../crud/request.crud'
import { clientsList } from '../state/clients.state'
import { BunSocketType } from '../types/bunSocket.type'
import { ClientType } from '../types/client.type'
import { SocketDataType } from '../types/socketData.type'

export async function blockUserChannel(ws: BunSocketType, data: SocketDataType) {
	let clientFound: ClientType
	console.log('Block user')
	for (let client of clientsList) {
		if (client.username === data.msg) {
			clientFound = client
		}
	}
	console.log('Client Found: ', clientFound)
	if (clientFound) {
		const doubleBlockStatus = await isDoubleBlock(ws, clientFound.username, data)
		if (doubleBlockStatus === 'error') return
		else if (doubleBlockStatus === 'true') {
			await deblockUser(ws, clientFound.username, data)
			return
		}
		console.log('User not already blocked, continue to block')

		const blockUserStatus = await blockUser(ws, clientFound.username, data)
		if (blockUserStatus === 'error') return
		if (blockUserStatus === 'true') {
			removeFromFriendRequests(ws, clientFound.username, data)
			removeFromFriendships(ws, clientFound.username, data)
		}

		data.msg = `User ${clientFound.username} has been blocked`
		data.type = 'notification'
		data.notificationLevel = 'error'
		ws.send(JSON.stringify(data))
	} else {
		data.msg = 'Player not found'
		data.type = 'error'
		ws.send(JSON.stringify(data))
	}
}
