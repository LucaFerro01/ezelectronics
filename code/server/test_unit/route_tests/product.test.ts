import { describe, test, expect, jest, beforeAll, afterEach, beforeEach, afterAll } from "@jest/globals";
import ProductDAO from "../../src/dao/productDAO";
import UserDAO from "../../src/dao/userDAO";
import ProductController from "../../src/controllers/productController";
import { Category, Product } from "../../src/components/product";
import request from 'supertest';
import { app } from "../../index";
import { cleanup } from "../../src/db/cleanup";
import Authenticator from "../../src/routers/auth";

jest.mock("../../src/controllers/productController");
jest.mock("../../src/routers/auth")
const baseURL = "/ezelectronics";


describe("Route product test", () => {

    test("Return 200 status code if product correctly register", async () => {
        const productTest = new Product(200, "Asus ROG 1", Category.SMARTPHONE, null, "Gaming phone", 1);
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {return next()});
        jest.spyOn(Authenticator.prototype, "isManager").mockImplementationOnce((req, res, next) => {return next()});
        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce(undefined);

        const response = await request(app).post(baseURL + "/products").send(productTest)
        expect(response.status).toBe(200);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(productTest.model, productTest.category, productTest.quantity, productTest.details, productTest.sellingPrice, productTest.arrivalDate);
    })
})