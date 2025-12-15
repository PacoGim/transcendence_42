import { navigate } from '../js/routing'
import { CurrentButtonStore } from '../stores/current_button.store'
import { KeyboardStore } from '../stores/keyboard.store'
import { v4 as uuidv4 } from 'uuid'
import { UserStore } from '../stores/user.store'
import { isUsernameFormatInvalid, isEmailFormatInvalid, isPwdFormatInvalid, isAvatarFileFormatInvalid, fieldInvalid, fieldValid} from '../functions/formValidation.js'

/* 
	1: Redirect user to OAuth page
	2: User logs in the third party page
	3: OAuth page returns with a private code
	4: The frontend does a POST request with the private code
	5: The backend then does a request to the same OAuth page 
	with the code to get back the user data
	6: The backend saves the user in DB and then returns the POST request
*/

const $spinner = document.querySelector('span[type="spinner"] img') as HTMLImageElement
const $menuButtons = document.querySelector('menu-buttons') as HTMLElement
const $registerForm = document.querySelector('register-form') as HTMLElement
const urlParams = new URLSearchParams(window.location.search)
const codeParam = urlParams.get('code')
const $oauthContainer = document.querySelector('register-form oauth-container') as HTMLElement

const actions = {
	selectRegisterType: {
		min: 0,
		max: 1,
		steps: 1,
		callback: selectRegisterType,
		values: ['42', 'User Form']
	}
}

const $page: HTMLElement = document.querySelector('page[type=register]')!

let currentButton: HTMLElement

const unsubCurrentButtonStore = CurrentButtonStore.subscribe(el => (currentButton = el))

if ($oauthContainer) {
	start42OAuth($oauthContainer)
}

if (codeParam) {
	fetch('https://localhost:443/api/auth', {
		method: 'POST',
		body: JSON.stringify({ code: codeParam })
	})
		.then(res => {
			if (res.status === 200) return res.json()
			$spinner.style.display = 'none'
			$menuButtons.style.display = 'flex'
			$registerForm.style.display = 'block'
		})
		.then(res => {
			UserStore.emit(res)
			navigate('')
		})
} else {
	$spinner.style.display = 'none'
	$menuButtons.style.display = 'flex'
	$registerForm.style.display = 'block'
}

function start42OAuth(self: HTMLElement) {
	const $el = document.createElement('a') as HTMLAnchorElement
	const $form = document.querySelector('user-form form') as HTMLElement

	const url =
		'https://api.intra.42.fr/oauth/authorize?' +
		new URLSearchParams({
			client_id: 'u-s4t2ud-9f30b2430e51c381ae5e38158295eef89230a74b070231a798bd1bcb7a01709c',
			redirect_uri: 'https://localhost/register',
			response_type: 'code',
			state: uuidv4()
		})

	$el.setAttribute('href', url)
	$el.innerText = '42'

	$form.style.display = 'none'

	self.innerHTML = ''
	self.append($el)
}

function getAvatarFile(avatarInput: HTMLInputElement): File | null {
	if (avatarInput && avatarInput.files && avatarInput.files.length > 0)
		return avatarInput.files[avatarInput.files.length - 1]
	return null
}

function changeAvatarPreview(avatarInput: HTMLInputElement) {
	let avatarObjectURL: string | null = null
	avatarInput.addEventListener("change", () => {
		const file = getAvatarFile(avatarInput)
		const avatarPreview = document.getElementById("avatarPreview") as HTMLImageElement
		if (isAvatarFileFormatInvalid(file)) {
			fieldInvalid(avatarInput, 'Avatar file must be an image and less than 100 KB')
			avatarInput.value = ""
			return
		} else
			fieldValid(avatarInput)
		if (avatarObjectURL) {
			URL.revokeObjectURL(avatarObjectURL)
			avatarObjectURL = null
		}
		if (file) {
			avatarObjectURL = URL.createObjectURL(file)
			avatarPreview.src = avatarObjectURL
		}
	})
}

function hasInvalidFields(form: HTMLElement): boolean {
	return form.querySelectorAll('.invalid-field').length > 0
}

function handleUserForm(self: HTMLElement) {
	const $el = document.createElement('span') as HTMLSpanElement
	const $form = document.querySelector('user-form form') as HTMLElement
	const $submitBtn = document.querySelector('user-form form button[type="submit"]') as HTMLElement

	$form.style.display = 'block'
	$el.innerText = 'User Form'
	self.innerHTML = ''

	const $avatarInput = $form.querySelector('input[name="avatar"]') as HTMLInputElement
	$avatarInput.value = ""
	changeAvatarPreview($avatarInput)

	const $usernameField = ($form.querySelector('input[name="username"]') as HTMLInputElement)
	$usernameField.addEventListener('input', () => {
		if (isUsernameFormatInvalid($usernameField.value))
			fieldInvalid($usernameField, 'Username must be between 4 and 20 characters long and contain only letters, numbers and underscores')
		else
			fieldValid($usernameField)
	})
	const $emailField = ($form.querySelector('input[name="email"]') as HTMLInputElement)
	$emailField.addEventListener('input', () => {
		if (isEmailFormatInvalid($emailField.value))
			fieldInvalid($emailField, 'Invalid email format')
		else
			fieldValid($emailField)
	})
	const $confirmEmailField = ($form.querySelector('input[name="confirmEmail"]') as HTMLInputElement)
	$confirmEmailField.addEventListener('input', () => {
		if ($confirmEmailField.value !== $emailField.value)
			fieldInvalid($confirmEmailField, 'Emails do not match')
		else
			fieldValid($confirmEmailField)
	})
	const $passwordField = ($form.querySelector('input[name="password"]') as HTMLInputElement)
	$passwordField.addEventListener('input', () => {
		if (isPwdFormatInvalid($passwordField.value))
			fieldInvalid($passwordField, 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character')
		else
			fieldValid($passwordField)
	})
	const $confirmPasswordField = ($form.querySelector('input[name="confirmPassword"]') as HTMLInputElement)
	$confirmPasswordField.addEventListener('input', () => {
		if ($confirmPasswordField.value !== $passwordField.value)
			fieldInvalid($confirmPasswordField, 'Passwords do not match')
		else
			fieldValid($confirmPasswordField)
	})

	$submitBtn.onclick = (e) => {
		e.preventDefault()

		if (hasInvalidFields($form)) {
			alert('Form contains invalid fields.')
			return
		}

		const $username = ($form.querySelector('input[name="username"]') as HTMLInputElement).value
		const $email = ($form.querySelector('input[name="email"]') as HTMLInputElement).value
		const $confirmEmail = ($form.querySelector('input[name="confirmEmail"]') as HTMLInputElement).value
		const $password = ($form.querySelector('input[name="password"]') as HTMLInputElement).value
		const $confirmPassword = ($form.querySelector('input[name="confirmPassword"]') as HTMLInputElement).value
		let avatarFile: File | null = getAvatarFile($avatarInput)

		const formData = new FormData()
		formData.append('username', $username)
		formData.append('email', $email)
		formData.append('checkmail', $confirmEmail)
		formData.append('pwd', $password)
		formData.append('checkpwd', $confirmPassword)
		if (avatarFile)
			formData.append('avatar', avatarFile)
		else
			formData.append("avatar", "")
		console.log('Submitting register form with data:', {
			username: $username,
			email: $email,
			confirmEmail: $confirmEmail,
			password: $password,
			confirmPassword: $confirmPassword,
			avatar: avatarFile
		})
		fetch('https://localhost:443/register', {
			method: 'POST',
			body: formData
		}).then(res => {
			console.log("res status:", res.status)
			return res.json()
		}).then(json => {
			console.log('json:', json)
		})
	}

	self.append($el)
}

function selectRegisterType(registerType: string, self: HTMLElement) {
	if (registerType === '42') {
		start42OAuth(self)
	} else {
		handleUserForm(self)
	}
}

const unsubKeyStore = KeyboardStore.subscribe(key => {
	if (['ArrowLeft', 'ArrowRight'].includes(key.value)) {
		const data = currentButton?.dataset
		if (data && data?.stateValue) {
			const action = actions[data.action]
			const current = Number(data.stateValue)

			const min = action.min
			const max = action.max
			const steps = action.steps
			let newValue
			if (key.value === 'ArrowLeft') {
				newValue = current - steps
				if (newValue < min) newValue = max
			} else {
				newValue = current + steps
				if (newValue > max) newValue = min
			}
			data.stateValue = String(newValue)

			const index = (newValue - min) / steps

			const nextValue = action.values[index]

			action.callback(nextValue, currentButton)
		}
	}
})

const cleanPage = () => {
	$page.removeEventListener('cleanup', cleanPage)
	unsubCurrentButtonStore()
	unsubKeyStore()
}

$page.addEventListener('cleanup', cleanPage)

/////////// REGISTER ///////////
// fetch('/register', {
// 	method: 'POST',
// 	headers: {
// 		'Content-Type': 'application/json'
// 	},
// 	body: JSON.stringify({
// 		name: '2',
// 		pwd: 'password123',
// 		checkpwd: 'password123',
// 		email: '2@example.com',
// 		checkmail: '2@example.com',
// 		username: '2'
// 	})
// })
// 	.then(res => res.json())
// 	.then(data => console.log('Register response:', data))
