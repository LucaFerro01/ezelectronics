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
    let product : Product;

    beforeAll(() => {
        dao = new ProductDAO;
        product = new Product(200, "Motorola g84", Category.SMARTPHONE, "04/06/2024", "Best buy phone", 4);
    })


    test("Create product test method", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        })
        const resultInsert = await dao.insertProduct(product.model, product.category, product.quantity, product.details, product.sellingPrice, product.arrivalDate);
        expect(resultInsert).toBe(true);
    })

    test("Change quantity", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        })
        const insertProduct = await dao.insertProduct(product.model, product.category, product.quantity, product.details, product.sellingPrice, product.arrivalDate);
        //const resultChange = await dao.changeProductQuantity(product.model, 7, "05/05/2020");

        expect(insertProduct).toBe(true)
        //expect(resultChange).toBe(11)
    })

    /* test("Get Product", async () => {
        const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, callback) => {
            callback(null, product)
            return {} as Database
        })

        const getProducts = await dao.getAllProducts("model", null, "Motorola g84");
        expect(getProducts).toContain(product);
    }) */
})