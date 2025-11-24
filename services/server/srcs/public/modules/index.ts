import { CurrentButtonStore } from '../stores/current_button.store.js'
import { KeyboardStore } from '../stores/keyboard.store.js'

type LoginButtonValues = {
	[key: string]: {
		id: string
		inner: string
		route: string
	}
}

const loginButtonValues: LoginButtonValues = {
	loginButton: {
		id: 'registerButton',
		inner: 'Register',
		route: 'register'
	},
	registerButton: {
		id: 'loginButton',
		inner: 'Login',
		route: 'login'
	}
}

const $page: HTMLElement = document.querySelector('page[type=index]')!
let currentButton: HTMLElement

const unsubCurrentButtonStore = CurrentButtonStore.subscribe(el => (currentButton = el))

const unsubKeyStore = KeyboardStore.subscribe(key => {
	if (['ArrowLeft', 'ArrowRight'].includes(key)) {
		const nextValue = loginButtonValues[currentButton.id]
		if (nextValue) {
			currentButton.innerText = nextValue.inner
			currentButton.id = nextValue.id
			currentButton.dataset.route = nextValue.route
		}
	}
})

const cleanPage = () => {
	$page.removeEventListener('cleanup', cleanPage)
	unsubCurrentButtonStore()
	unsubKeyStore()
}

$page.addEventListener('cleanup', cleanPage)
