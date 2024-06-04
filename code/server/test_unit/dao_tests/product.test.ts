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
    let mockDBRun;

    beforeAll(() => {
        dao = new ProductDAO;
        product = new Product(200, "Motorola g84", Category.SMARTPHONE, "04/06/2024", "Best buy phone", 4);
        mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        })
    })


    test("Create product test method", async () => {
        const result = await dao.insertProduct(product.model, product.category, product.quantity, product.details, product.sellingPrice, product.arrivalDate);
        expect(result).toBe(true);
    })
})