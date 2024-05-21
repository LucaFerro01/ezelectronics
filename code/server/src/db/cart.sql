DROP TABLE carts;

CREATE TABLE carts (
    cartId INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    paid BOOLEAN NOT NULL,
    paymentDate TEXT
);

DROP TABLE cart_products;

CREATE TABLE cart_products (
    cartId INTEGER NOT NULL,
    model TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL
);

