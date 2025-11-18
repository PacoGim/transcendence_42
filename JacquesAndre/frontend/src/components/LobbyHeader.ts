import type { LobbyInfo } from "../types/Message.ts";

export class LobbyHeader {
    element = document.createElement("div");

    constructor() {
        // this.element.className = "lobby-header";
        this.element.className = "text-3xl font-bold underline"
    }

    update(lobby: LobbyInfo) {
        this.element.textContent = `Lobby: ${lobby.nb_active} / ${lobby.size}`;
    }

    mount(parent: HTMLElement) {
        parent.appendChild(this.element);
    }
}
