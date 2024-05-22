-- SQLite
CREATE TABLE Review (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT,
    user TEXT NOT NULL,
    score INTEGER,
    date DATE,
    comment TEXT,
    FOREIGN KEY(user) REFERENCES User(id),
    FOREIGN KEY(model) REFERENCES Product(id)
);