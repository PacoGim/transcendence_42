import { FrontType } from "../../types/message.type.ts"
import { launchGame } from "../functions/GameClientBab.ts"
import { json_parse, json_stringify } from "../functions/json_wrapper.ts"
import { getStoredMessages, storeMessage, storeMP } from "../functions/messagesLocalStorage.ts"

console.log("module chat.ts")

type User = {
	userId: string,
	pseudo: string,
	websocket: WebSocket | undefined
}

class ChatApp
{
	private lobbyDiv : HTMLDivElement
	private pseudoDiv : HTMLDivElement
	private statusDiv : HTMLDivElement
	private userListDiv : HTMLDivElement
	private messagesDiv : HTMLDivElement
	private messageInput : HTMLInputElement
	private origin : string
	private host : string
	private user : User = {userId:'', pseudo:'', websocket:undefined}
	private lobby : any
	private handleSendBound : undefined | ((e: KeyboardEvent)=>void)
	constructor()
	{
		console.log("constructor chat")
		this.lobbyDiv = document.getElementById("lobby") as HTMLDivElement
		this.pseudoDiv = document.getElementById("pseudo") as HTMLDivElement
		this.statusDiv = document.getElementById("status") as HTMLDivElement
		this.userListDiv = document.getElementById("userList") as HTMLDivElement
		this.messagesDiv = document.getElementById("messages") as HTMLDivElement
		this.messageInput = document.getElementById("chatInput") as HTMLInputElement
		this.origin = window.location.origin
		this.host = window.location.host
	}


	private showInput()
	{
		this.messageInput.classList.remove('hidden')
		this.messageInput.placeholder = 'type your message...'
		if (!this.handleSendBound) {
			this.handleSendBound = this.handleSend.bind(this)
			this.messageInput.addEventListener('keypress', this.handleSendBound)
		}
	}

	private hideInput()
	{
		this.messageInput.classList.add('hidden')
		if (this.handleSendBound) {
			this.messageInput.removeEventListener('keypress', this.handleSendBound)
			this.handleSendBound = undefined
		}
	}

	private handleSend(key: KeyboardEvent)
	{
		if (key?.key === 'Enter' && this.user.websocket?.readyState === WebSocket.OPEN)
		{
			const text = this.messageInput.value.trim()
			if (text)
			{
				this.user.websocket.send(json_stringify({ type: 'chat', text }))
				this.messageInput.placeholder = 'type your message...'
				this.messageInput.value = ''
			}
		}
	}

	updateStatus(state: 'logged' | 'connected' | 'disconnected' | 'in-game')
	{
		this.statusDiv.className = `ws-status ${state}`
		const puce = (state === 'connected' || state === 'in-game')?'🟢':'🔴'
		this.statusDiv.textContent = `${puce} ${state}`
	}

	async refreshUser() {
		try {
			const res = await fetch(`${this.origin}/api/user?userId=${this.user.userId}`)
			if (!res.ok) throw new Error(`https ${res.status}: ${res.statusText}`)
			const json = await res.json()
			this.user.pseudo = json.pseudo
			this.pseudoDiv.innerText = this.user.pseudo
		} catch (e) {
			console.error('Error user:', e)
			this.resetUser()
		}
	}

	resetUser() {
		if (this.user.websocket && this.user.websocket.readyState !== WebSocket.CLOSED) {
			this.user.websocket.close()
		}
		this.user = { userId: '', pseudo: '', websocket: undefined }
		localStorage.clear()
		this.pseudoDiv.innerText = ''
		this.hideInput()
		this.updateStatus('disconnected')
	}

	startGame(websocket: WebSocket, pseudo: string)
	{
		this.updateStatus("in-game")
		launchGame(this.user.websocket as WebSocket, this.user.pseudo)
	}

	displayMessage(message: any)
	{
		const newDiv = document.createElement('div')
		const { lobby } = message
		if (lobby) this.lobbyDiv.innerText = `Lobby: ${lobby.nb_active} / ${lobby.size}`
		if (message.type === 'error')
		{
			return console.error('Error: ', message.text)
		}
		if (message.type === 'system')
		{
			newDiv.className = 'message system'
			newDiv.textContent = message.text
		}
		else if (message.type === 'chat')
		{
			// Vérifie si le message vient de l'utilisateur courant
			const isSelf = message.from === this.user.pseudo

			newDiv.className = `message chat ${isSelf ? 'self' : 'other'}`
			newDiv.innerHTML = `
				<span class="from">${isSelf ? 'Me' : message.from}:</span>
				<span class="text">${message.text}</span>
			`
		}

		this.messagesDiv.appendChild(newDiv)
		this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight
	}

	refreshDisplayMessage()
	{
		this.messagesDiv.innerHTML = ""
		const messages = getStoredMessages()
		messages.forEach(msg=>this.displayMessage(msg))
	}

	async refreshWebSocket()
	{
		this.refreshDisplayMessage()
		if (this.user.websocket?.readyState === WebSocket.OPEN) return

		if (this.user.websocket && this.user.websocket.readyState !== WebSocket.CLOSED) this.user.websocket.close()

		if (!this.user.userId) return console.warn('Lobby ou user non défini, impossible d’ouvrir WebSocket.')

		const ws = new WebSocket(`wss://${this.host}/api/ws?userId=${this.user.userId}`)
		this.user.websocket = ws

		ws.addEventListener('open', () => {
			console.log('✅ WebSocket ouverte')
			this.updateStatus('connected')
			this.showInput()
		})

		ws.addEventListener('close', () => {
			console.log('❌ WebSocket fermée')
			this.updateStatus('disconnected')
			this.hideInput()
		})

		ws.addEventListener('message', e => {
			const message: FrontType = json_parse(e.data) as FrontType
					console.log(message)
					if (!message) return
					switch(message.type)
					{
						case('error'): return console.error("received:", message.text)
						case('system'): return console.warn("received:", message.text)

						case('duel'):
						{
							switch(message.action)
							{
								case("accept"): return this.startGame(ws, this.user.pseudo)
								case("decline"): return console.log(`duel has been declined from ${message.from}`)
								case("propose"):
								{
									if (confirm(`${message?.from} send you a duel, do you accept?`))
									{
										this.startGame(ws, this.user.pseudo)
										return ws.send(json_stringify({ type: 'duel', to: message?.from, action: 'accept' }))
									}
									else
										return ws.send(json_stringify({ type: 'duel', to: message?.from, action: 'decline' }))
								}
							}
							break
						}
						case ('chat'): {storeMessage(message); return this.refreshDisplayMessage()}
						case ('mp-from'): {storeMP(message); break}
						case ('mp-to'): {storeMP(message); break}
					}
		})
	}

	async refreshLobbyId() {
		try {
			const res = await fetch(`${this.origin}/api/lobby`)
			if (!res.ok) throw new Error(`https ${res.status}: ${res.statusText}`)
			this.lobby = await res.json()
			console.log('lobby: ', json_stringify(this.lobby))
			this.lobbyDiv.innerText = `Lobby: ${this.lobby.nb_active} / ${this.lobby.size}`
		} catch (e) {
			console.error('Error lobby:', e)
		}
	}

	public async start()
	{
		const storedUser = localStorage.getItem('user')
		if (storedUser)
		{
			this.user = { ...this.user, ...json_parse(storedUser) }
			await this.refreshUser()
		}
		await this.refreshLobbyId()

	if (!this.user.userId) {
		const inputPseudo = document.createElement('input')
		const buttonPseudo = document.createElement('button')
		const errorPseudo = document.createElement('div')
		inputPseudo.placeholder = 'Type your pseudo...'
		buttonPseudo.innerText = 'Connect'
		inputPseudo.className = 'pseudo-input'
		buttonPseudo.className = 'pseudo-button'
		document.getElementById("containerLogin")?.append(inputPseudo, errorPseudo, buttonPseudo)

		buttonPseudo.addEventListener('click', async () => {
			let status
			try {
				const res = await fetch(`${this.origin}/api/lobby`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: json_stringify({ pseudo: inputPseudo.value })
				})
				status = res.ok
				const json = await res.json()
				if (!status) throw new Error(json?.error)

				this.user.userId = json.userId
				this.user.pseudo = json.pseudo
				this.pseudoDiv.innerText = this.user.pseudo
				localStorage.setItem('user', json_stringify({ userId: this.user.userId, pseudo: this.user.pseudo }))

				inputPseudo.remove()
				buttonPseudo.remove()
				errorPseudo.remove()

				await this.refreshWebSocket()
				console.log('👤 User connected', this.user)
			} catch (e: any) {
				this.pseudoDiv.innerText = ''
				inputPseudo.placeholder = 'Type your pseudo...'
				console.error('Error user connexion :', e)
				errorPseudo.textContent = e
			}
		})
	} else {
		await this.refreshWebSocket()
	}
	}
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading')
{
	document.addEventListener('DOMContentLoaded', () => {new ChatApp().start()})
}
else
{
	new ChatApp().start()
}
