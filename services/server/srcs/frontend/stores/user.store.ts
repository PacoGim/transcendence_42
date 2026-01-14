import { StateStore } from './state.store'

type Subscriber = (user: UserType) => void

export type UserType = {
	email: string
	username: string
	id?: number
	isValid: boolean
}

let user: any = {
	email: '',
	username: '',
	id: undefined,
	get isValid() {
		return Boolean(this.email && this.username && this.id)
	}
}

function createUserStore() {
	const subscribers = new Set<Subscriber>()

	function subscribe(fn: Subscriber) {
		subscribers.add(fn)
		fn(user)
		return () => subscribers.delete(fn)
	}

	function emit(newUser: UserType) {
		if (!newUser) return
		user.email = newUser.email
		user.username = newUser.username
		user.id = newUser.id

		StateStore.update({ username: user.username, id: user.id, email: user.email })

		for (const fn of subscribers) fn(user)
	}

	function clear() {
		UserStore.emit({
			email: '',
			username: '',
			id: undefined,
			isValid: false
		})
	}

	function getUserName() {
		return user.username
	}

	return { subscribe, emit, getUserName, clear }
}

declare global {
	interface Window {
		UserStore?: ReturnType<typeof createUserStore>
	}
}

export const UserStore = (window.UserStore ??= createUserStore())
