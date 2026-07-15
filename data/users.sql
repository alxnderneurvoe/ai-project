-- Sample user table for local authentication
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT DEFAULT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO users (username, password_hash, full_name, role) VALUES (
    'admin',
    '$2y$10$5A7fI7bapMCV5fPyc0nYeuDWuZUSTxTYZfW9kaUa6uXh6GxKA9HV6',
    'Administrator',
    'admin'
);
