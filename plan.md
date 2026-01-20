menu button Profile : error console when press left or right navigation
Chat Click Block User:
	User B bloque user A, donc user A ne peut pas friend_requests user B, par contre il peut encore le bloquer de son coté

	User blocking is notified if user properly blocked or error
	Add row in blocks DB
	
	If a blocked user is in User Blocking blocked list, prevent message to User Blocking socket altogether
	If the Blocked user send an mp to User Blocking, send a notification that the user has blocked him/her

	When clicking un block user again, unblock user and send notification to one or both (?)

	When Loading chat room, show the blocked user as blocked in user list

	Blocking a user should also:
		Remove pending friend requests from both users
		Remove friendship from both users

Chat Click Unblock User:
	User unblocking is notified if user properly unblocked or error
	Remove row in blocks DB

Chat click add friend:
	(Done) Add friendship row in DB
	(Done) Notify user requesting that friendship is sent

Chat click remove friend:
	Remove friendship row in DB
	Notify user requesting that friendship is now removed

Match History:
	1 vs 1 -> dates, players, score, winner

Login:
	When login in with 42 auth and not in db -> Interface is messed up (shows user form and block to log in 42oauth at the same time)
	When pressing login with the form or 42oauth and not registered, add a notification stating that the user isn't registered

Lobby:
	Player clicks on join game
		if Local:
			Goes to Alias and color select
			start game
		if remote:
			bind socket user socket to game
			Host goes to waiting list

Tournament:
	Paufiner

Remote 1v1

Friends:
	Create (current) friends page
	Create remove and mp buttons (friends page)

Friends request:
	User "A" send a friends request to "B" by clicking the add friend button
	User "B" gets a notification
	The friends list shows the request and the user can click it

	Logic:
		User clicks on add friends
		Goes to websocket
		Save request in DB ⚠️
		Sends confirmation to requesting user
		Sends a request to requested friend

Player Stats:
	Shows other players' match history

Chat:
	Block users, prevent from seeing messages
	Access other player information

2FA:
	Implement email based 2FA

Database:
	Frontend -> Send query to backend
	Backend  -> Forwards query to database
	Database -> Runs the query
	Database -> Return either a value or an error -> Backend
	Backend  -> Returns error or value -> Frontend
	Frontend -> Shows error message


BLOQUER ACCES USER (a faire):
- pas registered:
	+ friends
	+ others' match history
+ dans le waf


DB_ALED:
- friend_requests:
	+ bloquer -> faut enlever de friend_requests
	+ friendships -> faut enlever de friend_requests
- blocks:
	+ debloquer -> faut enlever de blocks
- friendships:
	+ bloquer -> faut enlever de friendship
