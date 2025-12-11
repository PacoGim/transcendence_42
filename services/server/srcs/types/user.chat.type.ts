export type StatusType = "chat" | "game"

export type UserChatType = {
	pseudo: string,
	connected: boolean,
	status: StatusType
}

export type LobbyType = {
	size: number,
	nb_active: number,
	users: UserChatType[]
}

export type UserPseudoDto = {
	userId: string,
	pseudo: string
}
