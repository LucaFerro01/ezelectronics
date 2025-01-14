import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals";

import ProductDAO from "../../src/dao/productDAO";
import db from "../../src/db/db";
import { Database } from "sqlite3";
import { Category, Product } from "../../src/components/product";
import { beforeEach } from "node:test";
import { EmptyProductStockError, LowProductStockError, ProductAlreadyExistsError, ProductNotFoundError } from "../../src/errors/productError";
import { get } from "http";

jest.mock("../../src/db/db.ts");

describe("ProductDAO", () => {
    let dao : ProductDAO;
    let product1 : Product;
    let product2 : Product;
    let product1Mock : Object;
    let product2Mock : Object;

    beforeAll(() => {
        jest.clearAllMocks;
        dao = new ProductDAO;
        product1 = new Product(200, "Motorola g84", Category.SMARTPHONE, "04/06/2024", "Best buy phone", 4);
        product2 = new Product(500, "Samsung galaxy s24", Category.SMARTPHONE, "11/06/2025", "Explode", 0);

        product1Mock = {
            "price" : 200,
            "model" : "Motorola g84",
            "category" : Category.SMARTPHONE,
            "arrivalDate" : "04/06/2024",
            "details" : "Best buy phone",
            "quantity" : 4
        };

        product2Mock = {
            "price" : 500,
            "model" : "Samsung galaxy s24",
            "category" : Category.SMARTPHONE,
            "arrivalDate" : "11/06/2025",
            "details" : "Explode",
            "quantity" : 0
        }
    })


    test("Create product, it should be return undefined", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        })
        const resultInsert = await dao.insertProduct(product1.model, product1.category, product1.quantity, product1.details, product1.sellingPrice, product1.arrivalDate);
        expect(resultInsert).toBe(undefined);
    })

    test("Change quantity, it should return the new quantity", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, callback) => {
            callback(null)
            return {} as Database
        })
        const mockDAOgetAllProducts = jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([product1])
        //const insertProduct = await dao.insertProduct(product1.model, product1.category, product1.quantity, product1.details, product1.sellingPrice, product1.arrivalDate);
        const resultChange = await dao.changeProductQuantity(product1.model, 7, "05/05/2020");

        //expect(insertProduct).toBe(true)
        expect(resultChange).toBe(11)
    })

    test("Get Products, it should return the all products", async () => {
        const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, callback) => {
            callback(null, [product1Mock])
            return {} as Database
        })
        const getProducts = await dao.getAllProducts("model", null, "Motorola g84");
        expect(getProducts).toContainEqual(product1);
    })

    test("Sell product, it should return the decrese quantity", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, callback) => {
            callback(null)
            return {} as Database
        })
        // mock of the function getAllProducts because it is use in the sellProduct function
        const expectProduct = new Product(product1.sellingPrice, product1.model, product1.category, product1.arrivalDate, product1.details, product1.quantity)
        const mockDAOgetAllProducts = jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([expectProduct]);
        const sellProducts = await dao.sellProduct("Motorola g84", 1, null);

        expect(sellProducts).toBe(3);


    })

    test("Available products, return the product with quantity greather than 0", async () => {
        const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, callback) => {
            callback(null, [product1Mock, product2Mock].slice(0, 1))
            return {} as Database
        })
        const availableProducts = await dao.availableProducts("category", "smartphone", null);
        console.log(availableProducts)
        expect(availableProducts).toContainEqual(product1);
    })

    test("Delete all products", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, callback) => {
            callback(null)
            return {} as Database
        })

        const isDeleted = await dao.deleteAllProducts();
        expect(isDeleted).toBe(true);
    })

    test("Delete one product", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, callback) => {
            callback(null)
            return {} as Database
        })

        const isDeleted = await dao.deleteProduct("Motorola g84");
        expect(isDeleted).toBe(true)
    })
})

describe("Product DAO with error", () => {
    //insert test with error
    let dao : ProductDAO;
    let product1 : Product;
    let product2 : Product;
    let product3 : Product;

    beforeAll(() => {
        dao = new ProductDAO;
        product1 = new Product(200, "Motorola g84", Category.SMARTPHONE, "04/06/2024", "Best buy phone", 4);
        product2 = new Product(500, "Samsung galaxy s24", Category.SMARTPHONE, "11/06/2025", "Explode", 0);
        product3 = new Product(300, "HP Pavillion", Category.LAPTOP, null, "Not enough", 1);
    })

    test("Insert product already exists", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error("UNIQUE constraint failed: Products.model"));
            return {} as Database;
        })
        expect(dao.insertProduct(product1.model, product1.category, product1.quantity, product1.details, product1.sellingPrice, product1.arrivalDate)).rejects.toThrow(ProductAlreadyExistsError);
    })

    test("Sell not existing product", () => {
        jest.clearAllMocks();

        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, callback) => {
            callback(null)
            return {} as Database
        });
        const mockDAOgetAllProducts = jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([]);

        expect(dao.sellProduct("iPhone", 3, null)).rejects.toThrow(ProductNotFoundError)
        expect(mockDBRun).toHaveBeenCalledTimes(0);
    })

    test("Sell product with no quantity", () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, callback) => {
            callback(null)
            return {} as Database
        });
        const mockDAOgetAllProducts = jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([product2]);
        
        expect(dao.sellProduct("Samsung galaxy s24", 1, null)).rejects.toThrow(EmptyProductStockError);
    })
    
    test("Sell product with not enough quantity", () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, callback) => {
            callback(null)
            return {} as Database
        });
        const mockDAOgetAllProducts = jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([product3]);

        expect(dao.sellProduct("HP Pavillion", 2, null)).rejects.toThrow(LowProductStockError);
    })
})