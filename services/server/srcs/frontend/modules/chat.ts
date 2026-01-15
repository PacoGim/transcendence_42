import { ChatStore } from '../stores/chat.store'
import { UserStore } from '../stores/user.store'
import { MessageType } from '../../types/chat.type'

const $page: HTMLElement = document.querySelector('page[type=chat]')!
const $chatInput: HTMLInputElement = document.getElementById('chatInput') as HTMLInputElement

function sendMessage() {
	const chatValue = $chatInput?.value
	if (chatValue === '') return

	const message: MessageType = {
		user: UserStore.getUserName(),
		msg: chatValue,
		type: 'mp',
		timestamp: Date.now(),
		to: 'username'
	}
	console.log(message)
	ChatStore.send(message)
	$chatInput.value = ''
}

$chatInput.addEventListener('keydown', evt => {
	if (evt.code === 'Enter') sendMessage()
})

document.querySelector('chat-input button')?.addEventListener('click', sendMessage)

const $chatWindow = document.querySelector('chat-window') as HTMLElement

function refreshChat(newChat: MessageType[]) {
	$chatWindow.innerText = ''
	newChat.forEach(chat => {
		let $line = document.createElement('chat-line')
		let $time = document.createElement('chat-time')
		let $user = document.createElement('chat-user')
		let $message = document.createElement('chat-message')

		if (chat.to === undefined) {
			$line.classList.add('g')
			$user.innerText = `${chat.user}`
		} else {
			$line.classList.add('mp')
			console.log("Chat: ", chat)
			if (chat.user === UserStore.getUserName()) {
				$user.innerText = `To ${chat.to}`
			} else {
				$user.innerText = `From ${chat.user}`
			}
		}

		const time = new Date(chat.timestamp).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		})

		$time.innerText = String(time)
		$message.innerText = chat.msg

		$line.appendChild($time)
		$line.appendChild($user)
		$line.appendChild($message)

		$chatWindow?.appendChild($line)
		$chatWindow.scrollTop = $chatWindow.scrollHeight
	})
}

const unsubChatStore = ChatStore.subscribe(chat => {
	refreshChat(chat)
})

refreshChat(ChatStore.getChats())

document.querySelectorAll<HTMLElement>('user-line').forEach(($userLine: HTMLElement) => {
	// if ($userLine.innerText === user) $userLine.classList.add('current-user')

	// $userLine.addEventListener('click', evt => {
	// 	const $target = evt.target as HTMLElement

	// 	console.log($target.innerText)
	// })
})

const cleanPage = () => {
	$page.removeEventListener('cleanup', cleanPage)
	unsubChatStore()
}

$page.addEventListener('cleanup', cleanPage)
