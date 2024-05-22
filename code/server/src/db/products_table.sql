-- SQLite
CREATE TABLE Products (
    price float NOT NULL,
    model text PRIMARY KEY NOT NULL,
    category text NOT NULL,
    arrivalDate text,
    details text,
    quantity integer NOT NULL
)