const langs = ['En', 'Fr', 'Es']

function updateLanguage() {
	const $languageOption = document.querySelector('span[data-action="updateLanguage"]')
	let lang = langs[$languageOption?.dataset?.currentoption]
	if (lang) $languageOption.innerText = `Language ${lang}`
}

function handleOptionClick(evt: any) {
	let dataset = evt.target.dataset

	if (dataset.action === 'updateLanguage') updateLanguage()
}

export function initOptionEvents() {
	document.querySelectorAll<HTMLElement>('span.traverse').forEach($el => {
		$el.addEventListener('click', handleOptionClick)
	})
	updateLanguage()
}

export function cleanOptionEvents() {
	document.querySelectorAll<HTMLElement>('span.traverse').forEach($el => {
		$el.removeEventListener('click', handleOptionClick)
	})
}
