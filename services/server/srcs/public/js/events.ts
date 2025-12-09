import { KeyboardStore } from '../stores/keyboard.store'

console.log('On key down event')

document.addEventListener('keydown', (evt: KeyboardEvent) => {
	console.log('Key down: ', evt.key)
	KeyboardStore.emit({
		value: evt.key,
		isShift: evt.shiftKey
	})
})
