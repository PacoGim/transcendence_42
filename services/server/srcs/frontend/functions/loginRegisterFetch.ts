import { navigate } from '../js/routing'
import { UserStore } from '../stores/user.store'
import { NotificationStore } from '../stores/notification.store'
import { start2FAFlow } from './twofa_auth'


export function fetchLogin(formData: FormData) {
	fetch('/login', {
		method: 'POST',
		body: formData
	})
		.then(res => {
			if (res.status >= 400) return { status: res.status }

			return res.json()
		})
		.then(res => {
			if (res?.status >= 400) {
				NotificationStore.notify('User not found', 'ERROR')
				return
			}
			if (res.info.message === '2FA_REQUIRED') {
				NotificationStore.notify('Two-Factor Authentication required. Please enter your 2FA code.', "INFO")
				const $page: HTMLElement = document.querySelector('page[type=login]')!
				start2FAFlow($page, 'login', () => {
					NotificationStore.notify('Login successful', "SUCCESS")
					UserStore.emit(res)
					navigate('')
				}, res)
				return
			}
			console.log('log: ', res)
			UserStore.emit(res)
			navigate('')
		})
}

export function fetchRegister(formData: FormData, registerForm: HTMLElement) {
	fetch('/register', {
		method: 'POST',
		body: formData
	})
		.then(async res => {
			const body = await res.json()

			if (!res.ok) {
				return {
					status: res.status,
					message: body.message
				}
			}
			return body
		})
		.then(res => {
			if (res?.status >= 400) {
				NotificationStore.notify('Form invalid', 'ERROR')
				return
			}
			console.log('FRONTEND --- registering form response: ', res)
			UserStore.emit(res)
			navigate('')
		})
}
