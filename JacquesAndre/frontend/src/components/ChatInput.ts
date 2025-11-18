export class ChatInput {
    element = document.createElement("input");
    onSend!: (text: string) => void;

    constructor() {
        this.element.className = "chat-input";

        this.element.addEventListener("keypress", e => {
            if (e.key === "Enter" && this.element.value.trim()) {
                this.onSend(this.element.value);
                this.element.value = "";
            }
        });
    }

    show() { this.element.classList.remove("hidden"); }
    hide() { this.element.classList.add("hidden"); }

    mount(parent: HTMLElement) {
        parent.appendChild(this.element);
    }
}
