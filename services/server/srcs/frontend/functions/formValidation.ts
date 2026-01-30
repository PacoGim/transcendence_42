export function hasInvalidFields(form: HTMLElement): boolean {
	// either has .invalid-field class, for any input, or no input at all were given in at least one field
	if (form.querySelectorAll('.invalid-field').length > 0)
		return true
	const fields = form.querySelectorAll<HTMLInputElement>('input[required]')
	
	for (const field of fields) {
		if (!field.value || field.value.trim() === '') return true
	}
	return false
}

export function fieldInvalid(el: HTMLElement, message?: string) {
	el.classList.add('invalid-field')
	const parent = el.parentElement
	if (!parent) return
	let errorSpan = parent.querySelector('.field-error-message') as HTMLElement | null
	if (!errorSpan) {
		errorSpan = document.createElement('span')
		errorSpan.classList.add('field-error-message')
		parent.appendChild(errorSpan)
	}
	if (message) errorSpan.textContent = message
}

export function fieldValid(el: HTMLElement) {
	el.classList.remove('invalid-field')
	const parent = el.parentElement
	if (!parent) return
	const errorSpan = parent.querySelector('.field-error-message') as HTMLElement | null
	if (errorSpan) errorSpan.remove()
}

export function setupFieldValidation(input: HTMLInputElement, validator: (value: string) => string | null) {
	input.addEventListener('input', () => {
		const error = validator(input.value)
		if (error) fieldInvalid(input, error)
		else fieldValid(input)
	})
}

export function setupConfirmFieldValidation(
	originalInput: HTMLInputElement,
	confirmInput: HTMLInputElement,
	errorMessage: string
) {
	confirmInput.addEventListener('input', () => {
		if (confirmInput.value !== originalInput.value) fieldInvalid(confirmInput, errorMessage)
		else fieldValid(confirmInput)
	})
}

export function setupUsernameAndPwdFieldsValidation($form: HTMLElement) {
	setupFieldValidation(
		$form.querySelector('input[name="username"]') as HTMLInputElement,
		validateUsernameFormat
	)
	setupFieldValidation(
		$form.querySelector('input[name="pwd"]') as HTMLInputElement,
		validatePwdFormat
	)
}

export function setupAllFieldValidation($form: HTMLElement) {
	setupFieldValidation(
		$form.querySelector('input[name="username"]') as HTMLInputElement,
		validateUsernameFormat
	)
	setupFieldValidation(
		$form.querySelector('input[name="email"]') as HTMLInputElement,
		validateEmailFormat
	)
	const $confirmEmailField = $form.querySelector('input[name="checkmail"]') as HTMLInputElement
	setupFieldValidation(
		$confirmEmailField,
		validateConfirmEmailFormat
	)
	setupFieldValidation(
		$form.querySelector('input[name="pwd"]') as HTMLInputElement,
		validatePwdFormat
	)
	const $confirmPasswordField = $form.querySelector('input[name="checkpwd"]') as HTMLInputElement
	setupFieldValidation(
		$confirmPasswordField,
		validateConfirmPwdFormat
	)
}

export function resetAvatarButton(resetBtn: HTMLButtonElement, avatarInput: HTMLInputElement, avatarPreview: HTMLImageElement) {
	resetBtn.addEventListener('click', () => {
		avatarPreview.src = '/images/avatars/baseAvatar.jpg'
		avatarInput.value = ''
		fieldValid(avatarInput)
	})
}

export function setupAvatarPreview(avatarInput: HTMLInputElement, avatarPreview: HTMLImageElement) {
	avatarInput.value = ''
	avatarPreview.src = '/images/avatars/baseAvatar.jpg'

	let avatarObjectURL: string | null = null
	avatarInput.addEventListener('change', () => {
		const file = avatarInput.files?.[0] || null
		const avatarError = validateAvatarFormat(file)
		if (avatarError) {
			fieldInvalid(avatarInput, avatarError)
			return
		} else fieldValid(avatarInput)
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

export function validateUsernameFormat(username: string): string | null {
	const trimmedUsername = username.trim()
	if (trimmedUsername === '') return 'Username is required'
	if (trimmedUsername.length < 4) return 'Username must be at least 4 characters'
	if (trimmedUsername.length > 20) return 'Username must be at most 20 characters'
	if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) return 'Only letters, numers, _ and - are allowed'
	return null
}

export function validateEmailFormat(email: string): string | null {
	const trimmedEmail = email.trim()
	if (trimmedEmail === '') return 'Email is required'
	if (!/^(?!.*\.\.)([a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*)@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/.test(email)) return 'Invalid email format'
	if (trimmedEmail.length > 320) return 'Email is too long'
	return null
}

export function validateConfirmEmailFormat(confirmEmail: string, email?: string): string | null {
	const emailValue = email || (document.querySelector('input[name="email"]') as HTMLInputElement).value
	const trimmedEmail = emailValue.trim()
	const trimmedConfirmEmail = confirmEmail.trim()
	if (trimmedEmail !== trimmedConfirmEmail) return 'Emails do not match'
	return null
}

export function validatePwdFormat(pwd: string): string | null {
	if (pwd == '') return 'Password is required'
	if (pwd.length < 8) return 'Password must be at least 8 characters'
	if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/.test(pwd)) return 'Required: 1 uppercase, 1 lowercase, 1 number, 1 special character (\!\@\#\$\%\^\&\*\_)'
	return null
}

export function validateConfirmPwdFormat(confirmPwd: string, pwd?: string): string | null {
	const pwdValue = pwd || (document.querySelector('input[name="pwd"]') as HTMLInputElement).value
	if (pwdValue !== confirmPwd) return 'Passwords do not match'
	return null
}

export function validateAvatarFormat(avatarFile: File | null): string | null {
	if (avatarFile && avatarFile.size > 100 * 1024) return 'File must be less than 100 KB'
	if (avatarFile && !avatarFile.type.startsWith('image/')) return 'File must be an image'
	return null
}

export function createFormData(form: HTMLElement, avatarInput: HTMLInputElement): FormData {
	const formData = new FormData()
	formData.append('username', (form.querySelector('input[name="username"]') as HTMLInputElement).value.trim())
	formData.append('email', (form.querySelector('input[name="email"]') as HTMLInputElement).value.trim())
	formData.append('checkmail', (form.querySelector('input[name="checkmail"]') as HTMLInputElement).value.trim())
	formData.append('pwd', (form.querySelector('input[name="pwd"]') as HTMLInputElement).value)
	formData.append('checkpwd', (form.querySelector('input[name="checkpwd"]') as HTMLInputElement).value)
	const avatarFile: File | null = avatarInput.files?.[0] || null
	if (avatarFile) formData.append('avatar', avatarFile)
	else formData.append('avatar', '')

	return formData
}

export function createLoginFormData(form: HTMLElement): FormData {
	const formData = new FormData()
	formData.append('username', (form.querySelector('input[name="username"]') as HTMLInputElement).value.trim())
	formData.append('pwd', (form.querySelector('input[name="pwd"]') as HTMLInputElement).value.trim())

	return formData
}
