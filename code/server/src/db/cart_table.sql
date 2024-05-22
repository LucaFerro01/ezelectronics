CREATE TABLE Cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer text NOT NULL,
    paid INTEGER DEFAULT 0,
    paymentDate DATE,
    total DECIMAL(10, 2) DEFAULT 0.0,
    products TEXT,
    FOREIGN KEY (customer) REFERENCES User(id)
);
