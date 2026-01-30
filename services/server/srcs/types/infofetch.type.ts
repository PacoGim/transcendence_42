export type InfoFetchType = {
	id?: number
	email?: string
	username?: string
	has_2fa?: boolean
	avatar?: string
	info: {
		status: number
		message?: string
	}
}
