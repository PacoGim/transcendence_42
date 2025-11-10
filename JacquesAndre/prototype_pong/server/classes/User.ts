// classes/User.ts
import { WebSocket } from "ws";

export class User {
  constructor(
    public readonly id: string,
    public readonly pseudo: string,
    public readonly socket: WebSocket
  ) {}

  send(data: any) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  close(reason?: string) {
    this.socket.close(1000, reason);
  }
}
