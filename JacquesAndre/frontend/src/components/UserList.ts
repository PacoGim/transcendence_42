import type { User } from "../types/User.ts";

export class UserList {
    element = document.createElement("div");
    onMP!: (pseudo: string) => void;

    constructor() {
        this.element.className = "user-list";
        this.element.style.display = "none";

        this.element.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "BUTTON" && target.dataset.action === "mp") {
                const pseudo = target.closest(".user-item")!.getAttribute("data-user-id")!;
                this.onMP?.(pseudo);
            }
        });
    }

    update(users: User[], currentPseudo: string) {
        this.element.innerHTML = "";

        users
            .filter(u => u.pseudo !== currentPseudo)
            .forEach(u => {
                const div = document.createElement("div");
                div.className = "user-item";
                div.dataset.userId = u.pseudo;

                div.innerHTML = `
                    <span class="user-pseudo">${u.pseudo}</span>
                    <button class="user-action-btn" data-action="mp">MP</button>
                `;

                this.element.appendChild(div);
            });
    }

    show() {
        this.element.style.display = "block";
    }

    hide() {
        this.element.style.display = "none";
    }

    mount(parent: HTMLElement) {
        parent.appendChild(this.element);
    }
}
