import { v4 as uuidv4 } from 'uuid'

export function start42OAuth(self: HTMLElement, uri: string) {
	const $el = document.createElement('a') as HTMLAnchorElement
	const $form = document.querySelector('user-form form') as HTMLElement

	const url =
		'https://api.intra.42.fr/oauth/authorize?' +
		new URLSearchParams({
			client_id: 'u-s4t2ud-9f30b2430e51c381ae5e38158295eef89230a74b070231a798bd1bcb7a01709c',
			redirect_uri: uri,
			response_type: 'code',
			state: uuidv4()
		})

	$el.setAttribute('href', url)
	$el.innerText = '42'

	$form.style.display = 'none'

	self.innerHTML = ''
	self.append($el)
}