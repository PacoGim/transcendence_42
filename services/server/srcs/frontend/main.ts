import { CurrentButtonStore } from './stores/current_button.store'
import { PageUpdateStore } from './stores/page_state'
import { UserStore } from './stores/user.store'

// var BabylonState = {
// 	engine: null as BABYLON.Engine | null,
// 	scene: null as BABYLON.Scene | null,
// 	canvas: null as HTMLCanvasElement | null
// }

// window.BabylonState = BabylonState

const $bgContainer = document.querySelector('background-container')
let $bgVideo
let $bgImg

if ($bgContainer) {
	$bgVideo = $bgContainer.querySelector('video') as HTMLVideoElement
	$bgImg = $bgContainer.querySelector('img') as HTMLImageElement
	$bgVideo.addEventListener('play', showBGVideo)
}

if ($bgVideo && $bgImg) {
	setTimeout(() => {
		showBGVideo()
	}, 250)
}

function showBGVideo() {
	$bgVideo.removeEventListener('play', showBGVideo)
	$bgImg.style.opacity = '0'
}
PageUpdateStore.emit('')
const selectedElement: HTMLElement = document.querySelector('*[data-selected=true]') as HTMLElement
if (selectedElement) CurrentButtonStore.emit(selectedElement)

fetch('/get_payload', {
	method: 'GET',
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
	}
})
	.then(async res => {
		const payload = await res.json()
		if (!payload) return
		console.log('refresh PAYLOAD:', payload)
		console.log('refresh PAYLOAD info:', payload.userInfo)
		UserStore.emit({
			email: payload.userInfo.email,
			username: payload.userInfo.username,
			id: payload.userInfo.id,
			isValid: true
		})
	})

// StateStore.subscribe(config => {
// 	console.log(config)
// })

// document.addEventListener('keydown', function (event) {
// 	if (event.key === 'Tab') {
// 		event.preventDefault()
// 	}
// })
