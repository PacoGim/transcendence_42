type ChatType = {
	type : 'chat',
	text : string
}

type MpType = {
	type: 'mp',
	to: string,
	text: string,
}

export type InputType = {
	type: 'input',
	key: KeyType
}

export type KeyType = "none" | "+" | "-" | "space" | "chagGPT"

type DuelType = {
	type: 'duel',
	to: string,
	action: 'propose' | 'accept' | 'decline'
}

export type MessageType = ChatType | MpType | InputType | DuelType

export type FrontType = FrontErrorType | FrontChatType | FrontMpTypeFrom | FrontMpTypeTo | DuelResponse

export type FrontErrorType = {
	type: 'error' | 'system',
	text: string,
	timestamp: number
}

export type FrontChatType = {
	type: 'chat',
	from: string,
	text: string,
	timestamp: number
}

export type FrontMpTypeFrom = {
	type: 'mp',
	from: string,
	text: string,
	timestamp: number
}

export type FrontMpTypeTo = {
	type: 'mp',
	to: string,
	text: string,
	timestamp: number
}

export type DuelResponse = {
	type: 'duel',
	action: 'propose' | 'decline'
	from: string,
	timestamp:number
}
