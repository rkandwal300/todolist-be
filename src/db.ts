import Database from 'better-sqlite3';

const db = new Database('tasks.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    priority TEXT NOT NULL,
    category TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )
`);

export default db;
