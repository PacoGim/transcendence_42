import type { User } from "../types/User.ts";
import type { ChatMessage } from "../types/Message.ts";
import { stringify, parse } from "../utils/json.ts";

import { LobbyHeader } from "../components/LobbyHeader.ts";
import { UserList } from "../components/UserList.ts";
import { ChatMessages } from "../components/ChatMessages.ts";
import { ChatInput } from "../components/ChatInput.ts";
import { StatusIndicator } from "../components/StatusIndicator.ts";
import { MPWindow } from "../components/MPWindow.ts";

export class ChatApp {
    private root: HTMLElement;
    private user!: User;
    private ws?: WebSocket;

    private lobbyHeader = new LobbyHeader();
    private status = new StatusIndicator();
    private userList = new UserList();
    private messages = new ChatMessages();
    private input = new ChatInput();
    private mp = new MPWindow();

    constructor(root: HTMLElement) {
        this.root = root;
        this.root.classList.add("chat-container");
    }

    async init() {
        // charger user
        const storedUser = localStorage.getItem("user");
        if (storedUser)
        {
            this.user = { ...this.user, ...parse(storedUser) };
            await this.refreshUser();
        } else {
            return this.askPseudo();
        }

        await this.start();
    }

    private async start() {
        this.mountUI();
        this.setupEvents();

        await this.refreshLobby();
        await this.openWebSocket();
    }

    // --- UI ---
    private mountUI() {
        this.lobbyHeader.mount(this.root);
        this.status.mount(this.root);
        this.userList.mount(this.root);
        this.messages.mount(this.root);
        this.input.mount(this.root);
        this.mp.mount(this.root);
    }

    // --- Login pseudo ---
    private askPseudo() {
        const inputPseudo = document.createElement("input");
        inputPseudo.placeholder = "Type your pseudo...";
        inputPseudo.className = "pseudo-input";

        const btn = document.createElement("button");
        btn.className = "pseudo-button";
        btn.textContent = "Connect";

        this.root.append(inputPseudo, btn);

        btn.onclick = async () => {
            const res = await fetch("https://localhost:3000/api/lobby", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: stringify({ pseudo: inputPseudo.value })
            });

            const json = await res.json();

            this.user = json;
            localStorage.setItem("user", stringify(this.user));

            inputPseudo.remove();
            btn.remove();

            await this.start();
        };
    }

    // --- Events ---
    private setupEvents() {
        this.input.onSend = (text) => {
            this.ws?.send(stringify({ type: "chat", text }));
        };

        this.userList.onMP = (pseudo) => {
            const key = `mp_${pseudo}`;
            const stored = localStorage.getItem(key);
            const history = stored ? parse(stored) : [];

            this.mp.setTarget(pseudo);
            this.mp.loadHistory(history);
            this.mp.show();

            this.mp.onSend = (text) => {
                this.ws?.send(stringify({ type: "mp", text, to: pseudo }));
            };
        };
    }

    // --- Fetch user ---
    private async refreshUser() {
        const res = await fetch(`https://localhost:3000/api/user?userId=${this.user.userId}`);
        this.user = await res.json();
        localStorage.setItem("user", stringify(this.user));
    }

    // --- Fetch lobby ---
    private async refreshLobby() {
        const res = await fetch("https://localhost:3000/api/lobby");
        const lobby = await res.json();
        this.lobbyHeader.update(lobby);
        this.userList.update(lobby.users, this.user.pseudo);
    }

    // --- Websocket ---
    private async openWebSocket() {
        this.ws = new WebSocket(`wss://localhost:3000/api/ws?userId=${this.user.userId}`);

        this.ws.onopen = () => {
            this.status.set("connected");
            this.input.show();
        };

        this.ws.onmessage = (e) => {
            const msg = parse(e.data) as ChatMessage;

            // MP ?
            if (msg.type === "mp") {
                const key = `mp_${msg.from}`;
                const stored = localStorage.getItem(key);
                const list = stored ? parse(stored) : [];

                list.push(msg);
                localStorage.setItem(key, stringify(list));

                this.mp.addMessage(msg);
                return;
            }

            // Chat normal
            this.messages.add(msg, this.user.pseudo);

            // Mise à jour lobby ?
            if (msg.lobby) this.lobbyHeader.update(msg.lobby);
        };

        this.ws.onclose = () => {
            this.status.set("disconnected");
            this.input.hide();
        };
    }
}
