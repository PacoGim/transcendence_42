import { db } from "./db.js"

// Ajouter un utilisateur
export function addUser(username: string, passwordHash: string) {
  const stmt = db.prepare(`
    INSERT INTO users (username, password_hash) VALUES (?, ?)
  `)
  const result = stmt.run(username, passwordHash);
}

// Envoyer une demande d'ami
export function sendFriendRequest(requesterId: number, receiverId: number) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO friend_requests (requester_id, receiver_id, status)
    VALUES (?, ?, 'pending')
  `);
  stmt.run(requesterId, receiverId);
}

// Accepter une demande d'ami
export function acceptFriendRequest(requesterId: number, receiverId: number) {
  const tx = db.prepare(`
      UPDATE friend_requests
      SET status='accepted', updated_at=CURRENT_TIMESTAMP
      WHERE requester_id=? AND receiver_id=?
    `).run(requesterId, receiverId);

    // Ajouter dans la table friendships (user_id < friend_id)
    const [uid, fid] = requesterId < receiverId ? [requesterId, receiverId] : [receiverId, requesterId];
    db.prepare(`
      INSERT OR IGNORE INTO friendships (user_id, friend_id) VALUES (?, ?)
    `).run(uid, fid);
}

// Refuser ou bloquer une demande
export function rejectOrBlockFriendRequest(requesterId: number, receiverId: number, block: boolean = false) {
  db.prepare(`
    UPDATE friend_requests
    SET status = ?, updated_at=CURRENT_TIMESTAMP
    WHERE requester_id=? AND receiver_id=?
  `).run(block ? 'blocked' : 'pending', requesterId, receiverId);
}

// Lister tous les amis d'un utilisateur
export function listFriends(userId: number): number[] {
  const stmt = db.prepare(`
    SELECT CASE
      WHEN user_id = ? THEN friend_id
      ELSE user_id
    END AS friend_id
    FROM friendships
    WHERE user_id=? OR friend_id=?
  `);
  return stmt.all(userId, userId, userId).map((row: any) => row.friend_id as number);
}

// Lister les demandes entrantes
export function listPendingRequests(userId: number): number[] {
  const stmt = db.prepare(`
    SELECT requester_id FROM friend_requests
    WHERE receiver_id=? AND status='pending'
  `);
  return stmt.all(userId).map((row: any) => row.requester_id as number);
}

// Lister les demandes sortantes
export function listSentRequests(userId: number): number[] {
  const stmt = db.prepare(`
    SELECT receiver_id FROM friend_requests
    WHERE requester_id=? AND status='pending'
  `);
  return stmt.all(userId).map((row: any) => row.receiver_id as number);
}
