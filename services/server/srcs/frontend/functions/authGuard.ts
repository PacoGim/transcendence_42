import { navigate } from '../js/routing'

export function redirectIfAuthenticated() {
	fetch('/get_payload', {
		method: 'GET',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(async res => {
		const payload = await res.json()
		if (payload) navigate('')
	})
}

export function redirectIfNotAuthenticated() {
	fetch('/get_payload', {
		method: 'GET',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(async res => {
		const payload = await res.json()
		if (!payload) navigate('')
	})
}
