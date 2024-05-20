-- SQLite
CREATE TABLE Products (
    price float NOT NULL,
    model text SECONDARY KEY NOT NULL,
    category text SECONDARY KEY NOT NULL,
    arrivalDate text,
    details text,
    quantity integer NOT NULL
)