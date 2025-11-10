import {addUser, sendFriendRequest, listPendingRequests, acceptFriendRequest, listFriends} from "./friends.js"

const player1 = addUser('Player1', 'hash1');
const player2 = addUser('Player2', 'hash2');

sendFriendRequest(player1, player2);
console.log(listPendingRequests(player2)); // [player1]

acceptFriendRequest(player1, player2);
console.log(listFriends(player1)); // [player2]
console.log(listFriends(player2)); // [player1]
