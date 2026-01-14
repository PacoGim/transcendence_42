export type MessageType = {
	type: 'global' | 'mp' | 'auth'
	to?: number | string
	msg: string
	timestamp: number
	user: string
}
