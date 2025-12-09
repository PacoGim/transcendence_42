type Subscriber = (config: any) => void

let config = {
	textSize: 20
}

function createStateStore() {
	const subscribers = new Set<Subscriber>()

	function subscribe(fn: Subscriber) {
		subscribers.add(fn)
		fn(config)
		return () => subscribers.delete(fn)
	}

	function emit(config: any) {
		for (const fn of subscribers) fn(config)
	}

	function update(newConfig: any) {
		for (const fn of subscribers) fn(newConfig)
	}

	return { subscribe, emit, update }
}

declare global {
	interface Window {
		StateStore?: ReturnType<typeof createStateStore>
	}
}

export const StateStore = (window.StateStore ??= createStateStore())
