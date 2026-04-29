const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'letseat.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    UNIQUE NOT NULL,
    password_hash TEXT    NOT NULL,
    nickname      TEXT    NOT NULL,
    email         TEXT,
    university    TEXT,
    manner_score  REAL    NOT NULL DEFAULT 36.5,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT    NOT NULL,
    host_id        INTEGER NOT NULL REFERENCES users(id),
    people_limit   INTEGER NOT NULL DEFAULT 2,
    location       TEXT    NOT NULL,
    menu_category  TEXT,
    specific_menu  TEXT,
    meeting_time   TEXT    NOT NULL,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS room_participants (
    room_id   INTEGER NOT NULL REFERENCES rooms(id),
    user_id   INTEGER NOT NULL REFERENCES users(id),
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id    INTEGER NOT NULL REFERENCES rooms(id),
    user_id    INTEGER NOT NULL REFERENCES users(id),
    text       TEXT    NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    rater_id   INTEGER NOT NULL REFERENCES users(id),
    rated_id   INTEGER NOT NULL REFERENCES users(id),
    tags       TEXT    NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
