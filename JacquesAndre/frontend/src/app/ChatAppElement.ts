// ChatAppElement.ts
import { ChatApp } from "./ChatApp";

export class ChatAppElement extends HTMLElement {
    private app?: ChatApp;

    connectedCallback() {
        if (!this.app) {
            this.app = new ChatApp(this);
            this.app.init();
        }
    }
}

customElements.define("chat-app", ChatAppElement);
