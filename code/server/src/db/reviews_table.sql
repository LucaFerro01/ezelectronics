-- SQLite
CREATE TABLE Reviews (
    model text PRIMARY KEY NOT NULL,
    user_id text NOT NULL,
    score INTEGER,
    date TEXT,
    comment TEXT
);