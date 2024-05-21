CREATE TABLE carts (
    cart_id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    paid BOOLEAN NOT NULL,
    paymentDate TEXT
);

CREATE TABLE cart_products (
    cart_id INTEGER NOT NULL,
    model TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL
);