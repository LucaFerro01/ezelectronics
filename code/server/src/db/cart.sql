-- SQLite
DROP TABLE carts;
DROP TABLE cart_products;

CREATE TABLE carts (
    cartId INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    paid BOOLEAN NOT NULL,
    paymentDate TEXT
);

CREATE TABLE cart_products (
    cartId INTEGER NOT NULL,
    model TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (cartId) REFERENCES carts (cartId),
    FOREIGN KEY (model) REFERENCES Products (model)
);

INSERT INTO carts (username, paid) VALUES ("Pippo1", 0);
INSERT INTO carts (username, paid) VALUES ("Pippo2", 0);

INSERT INTO cart_products (cartId, model, price, category, quantity) VALUES (1, "iPhone13", 799.99, "smartphone", 1);
INSERT INTO cart_products (cartId, model, price, category, quantity) VALUES (1, "iPhone14", 899.99, "smartphone", 1);

UPDATE cart_products SET quantity = quantity + 1 WHERE model = "iPhone13" AND cartId = 1;
UPDATE cart_products SET quantity = quantity - 1 WHERE model = "iPhone13" AND cartId = 1;

SELECT c.paid, c.username, c.cartId, c.paymentDate, cp.model, cp.price, cp.category, cp.quantity
FROM carts AS c
LEFT JOIN cart_products AS cp
ON c.cartId = cp.cartId
WHERE c.username = "Pippo1" AND c.paid = 0;

UPDATE carts SET paid = 1, paymentDate = "2024-06-03" WHERE username = "Pippo1" AND paid = 0;

SELECT c.paid, c.username, c.cartId, c.paymentDate, cp.model, cp.price, cp.category, cp.quantity
FROM carts AS c
LEFT JOIN cart_products AS cp
ON c.cartId = cp.cartId
WHERE c.username = "Pippo1" AND c.paid = 1;

INSERT INTO carts (username, paid) VALUES ("Pippo1", 0);
INSERT INTO cart_products (cartId, model, price, category, quantity) VALUES (3, "iPhone13", 799.99, "smartphone", 1);

DELETE FROM cart_products
WHERE cartId IN (
    SELECT c.cartId FROM carts AS c
    WHERE c.paid = 0 AND c.username = "Pippo1"
);

SELECT c.paid, c.username, c.cartId, c.paymentDate, cp.model, cp.price, cp.category, cp.quantity
FROM carts AS c
LEFT JOIN cart_products AS cp
ON c.cartId = cp.cartId
WHERE c.username = "Pippo1" AND c.paid = 0;

SELECT c.cartId, c.username, c.paid, c.paymentDate, cp.model, cp.price, cp.category, cp.quantity
FROM carts AS c
LEFT JOIN cart_products AS cp
ON c.cartId = cp.cartId;

DELETE FROM carts;
DELETE FROM cart_products;