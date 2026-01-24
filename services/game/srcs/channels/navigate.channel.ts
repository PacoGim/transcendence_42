import User from '../classes/User.js';
import { BunSocketType } from '../types/bunSocket.type'
import { NavigateType } from '../types/message.type.js'

export function navigateChannel(ws: BunSocketType, data: NavigateType)
{
	console.log(`${ws.data.user.pseudo} navigate to '${data.navigate}'`)
	const user : User = ws.data.user
	user.navigate = data.navigate;
}
