import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals";

import ProductDAO from "../../src/dao/productDAO";
import crypto from "crypto";
import db from "../../src/db/db";
import { Database } from "sqlite3";
import { Category, Product } from "../../src/components/product";
import { beforeEach } from "node:test";

jest.mock("../../src/db/db.ts");

describe("ProductDAO", () => {
    let dao : ProductDAO;
    let product1 : Product;
    let product2 : Product;

    beforeAll(() => {
        dao = new ProductDAO;
        product1 = new Product(200, "Motorola g84", Category.SMARTPHONE, "04/06/2024", "Best buy phone", 4);
        product2 = new Product(500, "Samsung galaxy s24", Category.SMARTPHONE, "11/06/2025", "Explode", 0);
    })


    test("Create product test method", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        })
        const resultInsert = await dao.insertProduct(product1.model, product1.category, product1.quantity, product1.details, product1.sellingPrice, product1.arrivalDate);
        expect(resultInsert).toBe(true);
    })

    test("Change quantity", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        })
        const insertProduct = await dao.insertProduct(product1.model, product1.category, product1.quantity, product1.details, product1.sellingPrice, product1.arrivalDate);
        //const resultChange = await dao.changeProductQuantity(product.model, 7, "05/05/2020");

        expect(insertProduct).toBe(true)
        //expect(resultChange).toBe(11)
    })

    test("Get Product", async () => {
        const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, callback) => {
            callback(null, [product1])
            return {} as Database
        })

        const getProducts = await dao.getAllProducts("model", null, "Motorola g84");
        expect(getProducts).toContainEqual(product1);
    })

    test("Sell product", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, callback) => {
            callback(null)
            return {} as Database
        })
        // mock of the function getAllProducts because it is use in the sellProduct function
        const mockDAOgetAllProducts = jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([new Product(product1.sellingPrice, product1.model, product1.category, product1.arrivalDate, product1.details, product1.quantity - 1)]);

        const sellProducts = await dao.sellProduct("Motorola g84", 1, null);
        expect(sellProducts).toBe(3);


    })

    test("Available products", async () => {
        const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, callback) => {
            callback(null, [product1, product2].filter(p => p.quantity > 0))
            return {} as Database
        })

        const availableProducts = await dao.availableProducts("category", "smartphone", null);
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

        const isDeleted = await dao.deleteProducts("Motorola g84");
        expect(isDeleted).toBe(true)
    })
})

describe("Product DAO with error", () => {
    //insert test with error
})