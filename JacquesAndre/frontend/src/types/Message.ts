export interface ChatMessage {
    type: "chat" | "system" | "mp" | "error";
    text: string;
    from?: string;
    to?: string;
    lobby?: LobbyInfo;
}

export interface LobbyInfo {
    nb_active: number;
    size: number;
}
