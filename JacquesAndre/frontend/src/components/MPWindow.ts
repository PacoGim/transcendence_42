import type { ChatMessage } from "../types/Message.ts";

export class MPWindow {
    element = document.createElement("div");
    header = document.createElement("div");
    messages = document.createElement("div");
    input = document.createElement("input");
    sendBtn = document.createElement("button");

    onSend!: (text: string) => void;

    constructor() {
        this.element.className = "mp-window";
        this.header.className = "mp-header";
        this.messages.className = "mp-messages";

        this.input.className = "mp-input";
        this.sendBtn.className = "mp-send-btn";
        this.sendBtn.textContent = "Envoyer";

        this.header.innerHTML = `<span class="mp-close">&times;</span>`;
        this.header.querySelector(".mp-close")!.addEventListener("click", () => {
            this.hide();
        });

        this.sendBtn.addEventListener("click", () => {
            if (this.input.value.trim()) {
                this.onSend(this.input.value);
                this.input.value = "";
            }
        });

        this.element.append(this.header, this.messages, this.input, this.sendBtn);
        this.hide();
    }

    setTarget(pseudo: string) {
        this.header.innerHTML = `
            <span>MP: ${pseudo}</span>
            <span class="mp-close">&times;</span>
        `;
        this.header.querySelector(".mp-close")!
            .addEventListener("click", () => this.hide());
    }

    loadHistory(list: ChatMessage[]) {
        this.messages.innerHTML = "";
        list.forEach(m => this.addMessage(m));
    }

    addMessage(msg: ChatMessage) {
        const div = document.createElement("div");
        const isSelf = msg.to !== undefined;
        div.className = `message chat ${isSelf ? "self" : "other"}`;
        div.innerHTML = `
            <span class="from">${isSelf ? "Me" : msg.from}:</span>
            <span class="text">${msg.text}</span>
        `;
        this.messages.appendChild(div);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    show() { this.element.style.display = "block"; }
    hide() { this.element.style.display = "none"; }

    mount(parent: HTMLElement) {
        parent.appendChild(this.element);
    }
}
