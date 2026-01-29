type Subscriber = (key: string) => void

let state = {
	pageName: ''
}

function createPageUpdateStore() {
	const subscribers = new Set<Subscriber>()

	function subscribe(fn: Subscriber) {
		subscribers.add(fn)
		return () => subscribers.delete(fn)
	}

	function emit(key: string) {
		state.pageName = key
		for (const fn of subscribers) fn(key)
	}

	function getPageName() {
		return state.pageName
	}

	return { subscribe, emit, getPageName }
}

function createPageDestroyStore() {
	const subscribers = new Set<Subscriber>()

	function subscribe(fn: Subscriber) {
		subscribers.add(fn)
		return () => subscribers.delete(fn)
	}

	function emit(key: string) {
		for (const fn of subscribers) fn(key)
	}

	return { subscribe, emit }
}

declare global {
	interface Window {
		PageUpdateStore?: ReturnType<typeof createPageUpdateStore>
	}
	interface Window {
		PageDestroyStore?: ReturnType<typeof createPageDestroyStore>
	}
}

export const PageUpdateStore = (window.PageUpdateStore ??= createPageUpdateStore())
export const PageDestroyStore = (window.PageDestroyStore ??= createPageDestroyStore())
