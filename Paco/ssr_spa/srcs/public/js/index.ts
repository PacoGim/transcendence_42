let currentIdx = 0
let buttonList: HTMLElement[] = []
const $bgContainer = document.querySelector('background-container')

if ($bgContainer) {
	const $bgVideo = $bgContainer.querySelector('video') as HTMLVideoElement
	const $bgImg = $bgContainer.querySelector('img') as HTMLImageElement
	$bgVideo.addEventListener('canplaythrough', evt => {
		$bgImg.style.opacity = '0'
		setTimeout(() => {
			$bgVideo.play()
		}, 300)
	})
}

document.addEventListener('keyup', evt => {
	if (evt.key === 'ArrowDown') {
		if (currentIdx + 1 >= buttonList.length) currentIdx = 0
		else currentIdx++
	} else if (evt.key === 'ArrowUp') {
		if (currentIdx - 1 < 0) currentIdx = buttonList.length - 1
		else currentIdx--
	}
	unselectButtons()
	let currentButton = buttonList[currentIdx]
	if (currentButton?.dataset?.selected !== undefined) currentButton.dataset.selected = 'true'
})

document.querySelectorAll<HTMLElement>('.btn-traverse').forEach((el: HTMLElement, idx) => {
	buttonList.push(el)
	el.dataset.idx = String(idx)
	el.addEventListener('mouseenter', evt => {
		unselectButtons()
		currentIdx = Number(el.dataset.idx)
		el.dataset.selected = 'true'
	})
	el.addEventListener('mousedown', evt => {
		// console.log(buttonList[currentIdx])
	})
})

document.addEventListener('keypress', evt => {
	if (evt.key === 'Enter') {
		let currentButton = buttonList[currentIdx]
		if (currentButton) {
			const newRoute = currentButton.getAttribute('data-route')
			if (newRoute != undefined) navigate(newRoute)
		}
	}
})

function unselectButtons() {
	buttonList.forEach(el => (el.dataset.selected = 'false'))
}
