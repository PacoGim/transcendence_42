import type { ChatMessage } from "../types/Message.ts";

export class ChatMessages {
    element = document.createElement("div");

    constructor() {
        this.element.className = "messages";
    }

    add(message: ChatMessage, currentPseudo: string) {
        const div = document.createElement("div");

        if (message.type === "system") {
            div.className = "message system";
            div.textContent = message.text;
        } else if (message.type === "chat") {
            const isSelf = message.from === currentPseudo;
            div.className = `message chat ${isSelf ? "self" : "other"}`;
            div.innerHTML = `
                <span class="from">${isSelf ? "Me" : message.from}:</span>
                <span class="text">${message.text}</span>
            `;
        }

        this.element.appendChild(div);
        this.element.scrollTop = this.element.scrollHeight;
    }

    mount(parent: HTMLElement) {
        parent.appendChild(this.element);
    }
}
