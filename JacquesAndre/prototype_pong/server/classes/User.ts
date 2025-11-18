// classes/User.ts
import { WebSocket } from "ws";

export class User
{
  public readonly pseudo: string;
  constructor(
    public readonly id: string,
    pseudo: string | undefined,
    public readonly socket: WebSocket
  )
  {
    this.pseudo = pseudo?.trim() || `Player-${Math.floor(Math.random() * 1000)}`;
    console.log(`new user ${this.id} ${this.pseudo} `)
  }

  send(data: any)
  {
    if (this.socket.readyState === WebSocket.OPEN)
    {
      this.socket.send(JSON.stringify(data));
    }
  }

  close(reason?: string)
  {
    this.socket.close(1000, reason);
  }

  toJSON()
  {
    return {
      id: this.id,
      pseudo: this.pseudo,
      connected: this.socket.readyState === WebSocket.OPEN
    }
  }
}
