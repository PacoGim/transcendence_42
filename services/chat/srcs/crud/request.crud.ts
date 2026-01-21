import { dbPostQuery } from '../services/db.service'
import { BunSocketType } from '../types/bunSocket.type'
import { SocketDataType } from '../types/socketData.type'

export async function insertFriendRequest(ws: BunSocketType, new_friend: string, data: SocketDataType): Promise<boolean> {
	const res = await dbPostQuery({
		endpoint: 'dbRun',
		query: {
			verb: 'INSERT',
			sql: 'INSERT INTO friend_requests (from_username, to_username) VALUES (?, ?)',
			data: [ws.data.username, new_friend]
		}
	})
	console.log('INSERT FRIEND REQUEST --- insertFriendRequest: ', res)
	if (res.status >= 400) {
		data.msg = res.message
		data.type = 'error'
		ws.send(JSON.stringify(data))
		return false
	}
	return true
}

export async function isDoubleFriendRequest(ws: BunSocketType, friend: string, data: SocketDataType): Promise<string> {
	const res = await dbPostQuery({
		endpoint: 'dbGet',
		query: {
			verb: 'SELECT',
			sql: 'SELECT * FROM friend_requests WHERE from_username = ? AND to_username = ?',
			data: [ws.data.username, friend]
		}
	})
	console.log('INSERT FRIEND REQUEST --- isDoubleFriendRequest: ', res)
	if (res.status >= 400 && res.status !== 404)
	{
		data.msg = res.message
		data.type = 'error'
		ws.send(JSON.stringify(data))
		return 'error'
	}
	else if (res.data) {
		data.msg = 'Cannot send friend request as you have already sent one to this user.'
		data.type = 'info'
		ws.send(JSON.stringify(data))
		return 'true'
	}
	return 'false'
}

export async function isInFriendRequests(ws: BunSocketType, friend: string, data: SocketDataType): Promise<string> {
	const res = await dbPostQuery({
		endpoint: 'dbGet',
		query: {
			verb: 'SELECT',
			sql: 'SELECT * FROM friend_requests WHERE from_username = ? AND to_username = ?',
			data: [friend, ws.data.username]
		}
	})
	console.log('INSERT FRIEND REQUEST --- isInFriendRequests: ', res)
	if (res.status >= 400 && res.status !== 404)
	{
		data.msg = res.message
		data.type = 'error'
		ws.send(JSON.stringify(data))
		return 'error'
	}
	else if (res.data) {
		data.msg = 'Cannot send friend request as it is already pending. Add them as friends.'
		data.type = 'info'
		ws.send(JSON.stringify(data))
		return 'true'
	}
	return 'false'
}

export async function removeFromFriendRequests(ws: BunSocketType, friend: string, data: SocketDataType): Promise<boolean> {
	const res = await dbPostQuery({
		endpoint: 'dbRun',
		query: {
			verb: 'DELETE',
			sql: 'DELETE FROM friend_requests WHERE (from_username = ? AND to_username = ?) OR (from_username = ? AND to_username = ?)',
			data: [ws.data.username, friend, friend, ws.data.username]
		}
	})
	console.log('REMOVE --- removeFromFriendRequests: ', res)
	if (res.status >= 400) {
		data.msg = res.message
		data.type = 'error'
		ws.send(JSON.stringify(data))
		return false
	}
	console.log('Friend request removed from DB')
	return true
}