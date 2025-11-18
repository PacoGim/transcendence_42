// classes/LobbyManager.ts
import { Lobby } from "./Lobby.js";

export class LobbyManager
{
  private lobbies = new Map<string, Lobby>()

 toJSON()
 {
    return {
      size: this.lobbies.size,
      lobbies: Array.from(this.lobbies.values()).map(lobby => ({
        id: lobby.id,
        size: lobby.size,
        users: Array.from(
          // on accède à la liste des users via la méthode publique de Lobby
          (lobby as any).users?.values?.() ?? []
        ).map((u: any) => ({
          id: u.id,
          pseudo: u.pseudo,
          connected: u.socket.readyState === WebSocket.OPEN
        }))
      }))
    }
  }

  createLobby(id: string): Lobby
  {
    const lobby = new Lobby(id)
    this.lobbies.set(id, lobby)

    return lobby
  }

  getLobby(id: string): Lobby | undefined
  {
    return this.lobbies.get(id)
  }

  deleteLobby(id: string)
  {
    const lobby = this.lobbies.get(id)
    if (lobby)
    {
      lobby.close()
      this.lobbies.delete(id)
    }
  }
}
