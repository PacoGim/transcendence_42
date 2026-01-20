import { navigate } from '../js/routing'
import { StateStore } from '../stores/state.store'
import { UserStore } from '../stores/user.store'

const $page: HTMLElement = document.querySelector('page[type=profile]')!
const $pageTitle: HTMLElement = document.querySelector('page-title')!
const $profileStats: HTMLElement = document.querySelector('profile-stats')!
const $winStat: HTMLElement = $profileStats.querySelector('user-wins stat-value')!
const $ratioStat: HTMLElement = $profileStats.querySelector('user-ratio stat-value')!
const $lossesStat: HTMLElement = $profileStats.querySelector('user-losses stat-value')!

const unsubStateStore = StateStore.subscribe(async data => {
	let selectedProfile = data.selectedProfile

	if (selectedProfile !== undefined) {
		document.title = `${selectedProfile} Profile`
		$pageTitle.innerText = selectedProfile
	} else {
		document.title = `Profile`
		$pageTitle.innerText = 'Profile'
	}

	if (selectedProfile === undefined) selectedProfile = UserStore.getUserName()

	//TODO Fetch user data here!
	fetch('https://localhost:443/user_profile', {
		method: 'POST',
		body: JSON.stringify({ name: 'alice' })
	})
		.then(res => {
			if (res.status >= 400) return console.log('ERROR updating profile', res.status)
			return res.json()
		})
		.then(res => {
			console.log('RESRESRES', res)
		})
	// setWinLoss()
})

document.querySelector('#profileNavWithMockUser')?.addEventListener('click', () => {
	StateStore.update({ selectedProfile: 'John' })
	navigate('profile')
})

document.querySelector('#profileNavWithoutMockUser')?.addEventListener('click', () => {
	StateStore.update({ selectedProfile: undefined })
	navigate('profile')
})

function setWinLoss() {
	const win = 1000
	const loss = 10
	const ratio = Math.round((100 / (win + loss)) * win)
	$winStat.innerText = '' + win
	$lossesStat.innerText = '' + loss
	$ratioStat.innerText = ratio + '%'
}

function setMatches() {}

const cleanPage = () => {
	$page.removeEventListener('cleanup', cleanPage)
	// StateStore.update({ selectedProfile: undefined })
	unsubStateStore()
}

$page.addEventListener('cleanup', cleanPage)
