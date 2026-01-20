import sqlite3 from 'sqlite3'
import { log } from '../logs'

export default function initDb() {
	const db = new sqlite3.Database('/app/services/database/data/db.sqlite', err => {
		if (err) return log(`Could not connect to database: ${err}`, 'error')
		else log('Connected to database', 'info')
	})
	db.exec(`
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY NOT NULL,
				username TEXT NOT NULL UNIQUE,
				email TEXT NOT NULL UNIQUE,
				pwd TEXT,
				avatar TEXT,
				is_oauth INTEGER NOT NULL DEFAULT 0
			);

			CREATE TABLE IF NOT EXISTS queries_log (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				query_type TEXT,
				query TEXT NOT NULL,
				status TEXT CHECK( status IN ('success','failure') ) NOT NULL,
				error_code TEXT,
				error_message TEXT,
				latency_seconds REAL,
				executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);

			CREATE TABLE IF NOT EXISTS friend_requests (
				from_username TEXT NOT NULL,
				to_username   TEXT NOT NULL,
				created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,

				PRIMARY KEY (from_username, to_username),
				FOREIGN KEY (from_username) REFERENCES users(username) ON DELETE CASCADE,
				FOREIGN KEY (to_username)   REFERENCES users(username) ON DELETE CASCADE,
				CHECK (from_username != to_username)
			);

			CREATE TABLE IF NOT EXISTS friendships (
				username_1 TEXT NOT NULL,
				username_2 TEXT NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

				PRIMARY KEY (username_1, username_2),
				FOREIGN KEY (username_1) REFERENCES users(username) ON DELETE CASCADE,
				FOREIGN KEY (username_2) REFERENCES users(username) ON DELETE CASCADE,
			);

			CREATE TABLE IF NOT EXISTS blocks (
				blocker_username TEXT NOT NULL,
				blocked_username TEXT NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

				PRIMARY KEY (blocker_username, blocked_username),
				FOREIGN KEY (blocker_username) REFERENCES users(username) ON DELETE CASCADE,
				FOREIGN KEY (blocked_username) REFERENCES users(username) ON DELETE CASCADE,
				CHECK (blocker_username != blocked_username)
			);
			
			CREATE TABLE matches (
				id INTEGER PRIMARY KEY NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);

			CREATE TABLE match_players (
				match_id INTEGER NOT NULL,
				username TEXT NOT NULL,
				result TEXT NOT NULL CHECK (result IN ('win', 'lose')),
				PRIMARY KEY (match_id, username),
				FOREIGN KEY (match_id) REFERENCES matches(id),
				FOREIGN KEY (username) REFERENCES users(id)
			);

			
			CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships(username_1);
			CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships(username_2);
			CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_username);
			CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON friend_requests(to_username);
			
			INSERT INTO users (id, username, email, pwd, avatar, is_oauth) VALUES
(1,  'alice',  'alice@test.com',  'pwd1',  NULL, 0),
(2,  'bob',    'bob@test.com',    'pwd2',  NULL, 0),
(3,  'carol',  'carol@test.com',  'pwd3',  NULL, 0),
(4,  'dave',   'dave@test.com',   'pwd4',  NULL, 0),
(5,  'eve',    'eve@test.com',    'pwd5',  NULL, 0),
(6,  'frank',  'frank@test.com',  'pwd6',  NULL, 0),
(7,  'grace',  'grace@test.com',  'pwd7',  NULL, 0),
(8,  'heidi',  'heidi@test.com',  'pwd8',  NULL, 0),
(9,  'ivan',   'ivan@test.com',   'pwd9',  NULL, 0),
(10, 'judy',   'judy@test.com',   'pwd10', NULL, 0),
(11, 'kate',   'kate@test.com',   'pwd11', NULL, 0),
(12, 'leo',    'leo@test.com',    'pwd12', NULL, 0),
(13, 'mallory','mallory@test.com','pwd13', NULL, 0),
(14, 'nancy',  'nancy@test.com',  'pwd14', NULL, 0),
(15, 'oscar',  'oscar@test.com',  'pwd15', NULL, 0),
(16, 'peggy',  'peggy@test.com',  'pwd16', NULL, 0),
(17, 'quentin','quentin@test.com','pwd17', NULL, 0),
(18, 'ruth',   'ruth@test.com',   'pwd18', NULL, 0),
(19, 'sybil',  'sybil@test.com',  'pwd19', NULL, 0),
(20, 'trent',  'trent@test.com',  'pwd20', NULL, 0);

INSERT INTO friend_requests (from_username, to_username) VALUES
('alice','bob'),
('bob','carol'),
('carol','dave'),
('dave','eve'),
('eve','frank'),
('frank','grace'),
('grace','heidi'),
('heidi','ivan'),
('ivan','judy'),
('judy','kate'),
('kate','leo'),
('leo','mallory'),
('mallory','nancy'),
('nancy','oscar'),
('oscar','peggy'),
('peggy','quentin'),
('quentin','ruth'),
('ruth','sybil'),
('sybil','trent'),
('trent','alice');


INSERT INTO matches (id) VALUES
(1),(2),(3),(4),(5),
(6),(7),(8),(9),(10),
(11),(12),(13),(14),(15),
(16),(17),(18),(19),(20);

INSERT INTO match_players (match_id, username, result) VALUES
(1,'alice','win'),   (1,'bob','lose'),
(2,'alice','win'),   (2,'bob','lose'),
(3,'alice','win'),   (3,'bob','lose'),
(4,'carol','lose'),   (4,'dave','lose'), (4,'alice','win'),
(5,'ivan','win'),    (5,'judy','lose'),
(6,'kate','win'),    (6,'leo','lose'),
(7,'mallory','win'), (7,'nancy','lose'),
(8,'oscar','win'),   (8,'peggy','lose'),
(9,'quentin','win'), (9,'ruth','lose'),
(10,'sybil','win'),  (10,'trent','lose'),
(11,'bob','win'),    (11,'alice','lose'),
(12,'dave','win'),   (12,'carol','lose'),
(13,'frank','win'),  (13,'eve','lose'),
(14,'heidi','win'),  (14,'grace','lose'),
(15,'judy','win'),   (15,'ivan','lose'),
(16,'leo','win'),    (16,'kate','lose'),
(17,'nancy','win'),  (17,'mallory','lose'),
(18,'peggy','win'),  (18,'oscar','lose'),
(19,'ruth','win'),   (19,'quentin','lose'),
(20,'trent','win'),  (20,'sybil','lose');
`)
		
		
	console.log('\x1b[32m%s\x1b[0m', 'Tables created if not already exists')
	return db
}
