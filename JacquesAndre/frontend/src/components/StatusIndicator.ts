export class StatusIndicator {
    element = document.createElement("div");

    constructor() {
        this.element.className = "ws-status";
    }

    set(state: "connected" | "disconnected") {
        this.element.className = `ws-status ${state}`;
        this.element.textContent =
            state === "connected" ? "🟢 Connected" : "🔴 Disconnected";
    }

    mount(parent: HTMLElement) {
        parent.appendChild(this.element);
    }
}
