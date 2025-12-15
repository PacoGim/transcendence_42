export function fieldInvalid(el: HTMLElement, message?: string) {
    el.classList.add('invalid-field')
    let errorSpan = el.nextElementSibling as HTMLElement | null
    if (!errorSpan) {
        errorSpan = document.createElement('span')
        errorSpan.classList.add('field-error-message')
        el.parentNode?.insertBefore(errorSpan, el.nextSibling)
    }
    if (message)
        errorSpan.textContent = message
}

export function fieldValid(el: HTMLElement) {
    el.classList.remove('invalid-field')
    const errorSpan = el.nextElementSibling as HTMLElement | null
    if (errorSpan)
        errorSpan.remove()
}

export function isUsernameFormatInvalid(username: string): boolean { // a bouger dans "/functions"
	if (username.length < 4)
		return true
	if (username.length > 20)
		return true
	if (!/^[a-zA-Z0-9_]+$/.test(username))
		return true
	return false
}

export function isEmailFormatInvalid(email: string): boolean { // a bouger dans "/functions"
	if (!email.includes('@'))
		return true
	if (!email.includes('.'))
		return true
	if (email.lastIndexOf('.') < email.indexOf('@'))
		return true
	if (email.indexOf('@') === 0)
		return true
	if (email.lastIndexOf('.') === email.length - 1)
		return true
	if (email.indexOf('.') - email.indexOf('@') === 1)
		return true
	if (email.length > 320)
		return true
	return false
}

export function isPwdFormatInvalid(pwd: string): boolean { // a bouger dans "/functions"
	if (pwd.length < 8)
		return true
	if (!pwd.match(/[a-z]/))
		return true
	if (!pwd.match(/[A-Z]/))
		return true
	if (!pwd.match(/[0-9]/))
		return true
	if (!pwd.match(/[\W_]/))
		return true
	return false
}

export function isAvatarFileFormatInvalid(avatarFile: File | null): boolean {
	if (avatarFile && avatarFile.size > 100 * 1024) {
		return true
	}
	if (avatarFile && !avatarFile.type.startsWith('image/')) {
		return true
	}
	return false
}