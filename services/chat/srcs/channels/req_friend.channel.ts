import { clientsList } from '../state/clients.state'
import { BunSocketType } from '../types/bunSocket.type'
import { ClientType } from '../types/client.type'
import { SocketDataType } from '../types/socketData.type'
import { isClientBlocked } from '../crud/block.crud'
import { isFriend, insertFriendship } from '../crud/friend.crud'
import { insertFriendRequest, isDoubleFriendRequest, isInFriendRequests, removeFromFriendRequests } from '../crud/request.crud'

export async function reqFriendChannel(ws: BunSocketType, data: SocketDataType) {
	let clientFound: ClientType
	console.log('Friends request')
	for (let client of clientsList) {
		if (client.username === data.msg) {
			clientFound = client
		}
	}
	console.log('Client Found: ', clientFound)
	if (clientFound) {
		if (await isClientBlocked(ws, clientFound.username, data)) return
		console.log('User not blocked, check if friends')

		if (await isFriend(ws, clientFound.username, data)) return
		console.log('Users are not friends, check if double friend request')

		const doubleFriendRequest = await isDoubleFriendRequest(ws, clientFound.username, data)
		if (doubleFriendRequest === 'error' || doubleFriendRequest === 'true') return
		console.log('No double friend request, check if the other user has sent a friend request')
		const inFriendRequests = await isInFriendRequests(ws, clientFound.username, data)
		if (inFriendRequests === 'error') return
		else if (inFriendRequests === 'true')
		{
			console.log('User is in friend requests, add to friendships')

			if (!await insertFriendship(ws, clientFound, data)) return
			console.log('Friendship added to DB')

			await removeFromFriendRequests(ws, clientFound.username, data)
			console.log('Friend request removed from DB')
			return
		}

		console.log('User is not in friend requests, send friend request')
		if (!await insertFriendRequest(ws, clientFound.username, data)) return
		console.log('Friend request sent to DB')

		data.msg = clientFound.username
		data.type = 'req-friend'
		clientFound.socket.send(JSON.stringify(data))

		data.type = 'notification'
		data.notificationLevel = 'info'
		data.msg = `User ${ws.data.username} wants to be friends!`
		clientFound.socket.send(JSON.stringify(data))

		data.msg = `Friend request sent to ${ws.data.username}!`
		ws.send(JSON.stringify(data))
	} else {
		data.msg = 'Player not found'
		data.type = 'error'
		ws.send(JSON.stringify(data))
	}
}
