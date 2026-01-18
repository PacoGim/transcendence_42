import sqlite3 from 'sqlite3'
import { log } from '../logs'

export default function initDb() {
	const db = new sqlite3.Database('/app/services/database/data/db.sqlite', err => {
		if (err) return log(`Could not connect to database: ${err}`, 'error')
		else log('Connected to database', 'info')
	})
	db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY NOT NULL,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            pwd TEXT,
            avatar TEXT,
            is_oauth INTEGER NOT NULL DEFAULT 0
        )
    `)
	db.run(`
        CREATE TABLE IF NOT EXISTS queries_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query_type TEXT,
            query TEXT NOT NULL,
            status TEXT CHECK( status IN ('success','failure') ) NOT NULL,
            error_code TEXT,
            error_message TEXT,
            latency_seconds REAL,
            executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `)
	db.exec(`
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				username TEXT NOT NULL UNIQUE
			);

			CREATE TABLE IF NOT EXISTS friend_requests (
				from_user_id INTEGER NOT NULL,
				to_user_id   INTEGER NOT NULL,
				created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,

				PRIMARY KEY (from_user_id, to_user_id),
				FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
				FOREIGN KEY (to_user_id)   REFERENCES users(id) ON DELETE CASCADE,
				CHECK (from_user_id != to_user_id)
			);

			CREATE TABLE IF NOT EXISTS friendships (
				user_id_1 INTEGER NOT NULL,
				user_id_2 INTEGER NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

				PRIMARY KEY (user_id_1, user_id_2),
				FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
				FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE,
				CHECK (user_id_1 < user_id_2)
			);

			CREATE TABLE IF NOT EXISTS blocks (
				blocker_id INTEGER NOT NULL,
				blocked_id INTEGER NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

				PRIMARY KEY (blocker_id, blocked_id),
				FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
				FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
				CHECK (blocker_id != blocked_id)
			);

			CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships(user_id_1);
			CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships(user_id_2);
			CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_id);
			CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON friend_requests(to_user_id);
		`)
	console.log('\x1b[32m%s\x1b[0m', 'Users and queries_log tables created if not already exists')
	return db
}
