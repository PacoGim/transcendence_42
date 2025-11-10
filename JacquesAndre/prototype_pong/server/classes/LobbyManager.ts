// classes/LobbyManager.ts
import { Lobby } from "./Lobby.js";

export class LobbyManager {
  private lobbies = new Map<string, Lobby>();

  createLobby(id: string): Lobby {
    const lobby = new Lobby(id);
    this.lobbies.set(id, lobby);

    return lobby;
  }

  getLobby(id: string): Lobby | undefined {
    return this.lobbies.get(id);
  }

  deleteLobby(id: string) {
    const lobby = this.lobbies.get(id);
    if (lobby) {
      lobby.close();
      this.lobbies.delete(id);
    }
  }

  list() {
    return Array.from(this.lobbies.keys());
  }
}
