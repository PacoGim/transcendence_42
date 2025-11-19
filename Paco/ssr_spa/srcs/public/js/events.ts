import { cleanOptionEvents, initOptionEvents } from '../modules/options.js'
import { cleanKeyNav, initKeyNav } from './key_nav.js'

export function initEvents() {
	console.log("Initializing Events")
	initKeyNav()
	initOptionEvents()
}

export function cleanEvents() {
	console.log("Cleaning Events")
	cleanKeyNav()
	cleanOptionEvents()
}
