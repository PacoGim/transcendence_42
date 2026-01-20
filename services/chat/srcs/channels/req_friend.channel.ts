import { dbPostQuery } from '../services/db.service'
import { clientsList } from '../state/clients.state'
import { BunSocketType } from '../types/bunSocket.type'
import { ClientType } from '../types/client.type'
import { SocketDataType } from '../types/socketData.type'

async function isClientBlocked(blocker: string, blocked: string): Promise<any> {
	const res = await dbPostQuery({
		endpoint: 'dbGet',
		query: {
			verb: 'SELECT',
			sql: 'SELECT * FROM blocks WHERE (blocker_username = ? AND blocked_username = ?) OR (blocker_username = ? AND blocked_username = ?)',
			data: [blocker, blocked, blocked, blocker]
		}
	})
	console.log('INSERT FRIEND REQUEST --- isClientBlocked: ', res)
	return res
}

async function insertFriendRequest(from: string, to: string): Promise<any> {
	const res = await dbPostQuery({
		endpoint: 'dbRun',
		query: {
			verb: 'INSERT',
			sql: 'INSERT INTO friend_requests (from_username, to_username) VALUES (?, ?)',
			data: [from, to]
		}
	})
	console.log('INSERT FRIEND REQUEST --- insertFriendRequest: ', res)
	return res
}

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
		// if blocked, cannot send request -> SELECT from blocks, if here stop if not here INSERT send request
		// if already in friendships, cannot send request -> SELECT from friendships, if here stop if not here INSERT send request
		// if A already sent request to B, cannot send request again from B -> DELETE from friend_requests and INSERT to friendships
		let res = await isClientBlocked(ws.data.username, clientFound.username)
		if (res.status >= 400 && res.status !== 404)
		{
			data.msg = res.message
			data.type = 'error'
			ws.send(JSON.stringify(data))
			return
		}
		else if (res.data) {
			data.msg = 'Cannot send friend request. One of the users has blocked the other.'
			data.type = 'error'
			ws.send(JSON.stringify(data))
			return
		}
		console.log('User not blocked, send friend request')

		res = await insertFriendRequest(ws.data.username, clientFound.username)
		if (res.status >= 400) {
			data.msg = res.message
			data.type = 'error'
			ws.send(JSON.stringify(data))
			return
		}
		console.log('Friend request sent to DB: ', res)

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
