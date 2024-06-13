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

beforeEach(() => {
    jest.clearAllMocks();
})


describe("Route product test", () => {

    const stdTestProduct = new Product(200, "Asus ROG 1", Category.SMARTPHONE, null, "Gaming phone", 1);
    const stdTestProduct2 = new Product(200, "IDK", Category.APPLIANCE, null, "Idk what is it an appliance", 0);

    test("Return 200 status code if product correctly register", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {return next()});
        jest.spyOn(Authenticator.prototype, "isManager").mockImplementationOnce((req, res, next) => {return next()});
        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce(undefined);

        const response = await request(app).post(baseURL + "/products").send(stdTestProduct)
        expect(response.status).toBe(200);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(stdTestProduct.model, stdTestProduct.category, stdTestProduct.quantity, stdTestProduct.details, stdTestProduct.sellingPrice, stdTestProduct.arrivalDate);
    })

    test("Return 401 because the user is not logged in", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {return res.status(401).json({error: "Unauthenticated user", status: 401})});
        jest.spyOn(Authenticator.prototype, "isManager").mockImplementationOnce((req, res, next) => {return next()});
        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce(undefined);

        const response = await request(app).post(baseURL + "/products").send(stdTestProduct)
        expect(response.status).toBe(401);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(0);
    })

    test("Return 422 status code, for low quantity", async () => {
        const testProduct = new Product(200, "IDK", Category.APPLIANCE, null, "Idk what is it an appliance", 0);
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {return next()});
        jest.spyOn(Authenticator.prototype, "isManager").mockImplementationOnce((req, res, next) => {return next()});
        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce(undefined);

        const response = await request(app).post(baseURL + "/products").send(testProduct);
        expect(response.status).toBe(422);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(0);
    })

    test("Return the new quantity of the product", async () => {
        const testAdd = {
            quantity : 1,
            changeDate : "2024-06-12"
        }

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {return next()});
        jest.spyOn(Authenticator.prototype, "isManager").mockImplementationOnce((req, res, next) => {return next()});
        jest.spyOn(ProductController.prototype, "changeProductQuantity").mockResolvedValueOnce(testAdd.quantity);

        const response = await request(app).patch(baseURL + "/products/" + stdTestProduct.model).send(testAdd);

        expect(response.status).toBe(200);
        expect(JSON.parse(response.text)["quantity"]).toBe(testAdd.quantity);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledWith(stdTestProduct.model, testAdd.quantity, testAdd.changeDate);
        // need to test with changeDate : ""
    })

    test("Return new quantity of the sold product", async () => {
        const testSold = {
            quantity : 1,
            sellingDate : "2024-06-12"
        }

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {return next()});
        jest.spyOn(Authenticator.prototype, "isManager").mockImplementationOnce((req, res, next) => {return next()});
        jest.spyOn(ProductController.prototype, "sellProduct").mockResolvedValueOnce(testSold.quantity);

        const response = await request(app).patch(baseURL + "/products/" + stdTestProduct.model + "/sell").send(testSold);

        expect(response.status).toBe(200);
        expect(JSON.parse(response.text)["quantity"]).toBe(testSold.quantity);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(stdTestProduct.model, testSold.quantity, testSold.sellingDate);
    })

    test("Return all the products (without filter)", async () => {
        const listOfProducts = [stdTestProduct, stdTestProduct2];
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {return next()});
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {return next()});
        jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce(listOfProducts);

        const response = await request(app).get(baseURL + "/products").send()

        expect(response.status).toBe(200);
        expect(JSON.parse(response.text)).toEqual(listOfProducts);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledWith(undefined, undefined, undefined);
    })

    test("Return all the products with category filter (Smartphone)", async () => {
        const listOfProducts = [stdTestProduct, stdTestProduct2];
        const filter = {grouping : "category", category : Category.SMARTPHONE, model : ""};
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {return next()});
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {return next()});
        jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce(listOfProducts.filter(p => p.category === Category.SMARTPHONE));

        const response = await request(app).get(baseURL + "/products?grouping=category&category=Smartphone").send()
        expect(response.status).toBe(200);
        expect(JSON.parse(response.text)).toEqual(listOfProducts.filter(p => p.category === Category.SMARTPHONE));
        expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledWith("category", Category.SMARTPHONE, undefined);
    }) 

    test("Return the available products (without filter)", async () => {
        const listOfProducts = [stdTestProduct, stdTestProduct2];
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {return next()});
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {return next()});
        jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce(listOfProducts.filter(p => p.quantity > 0));

        const response = await request(app).get(baseURL + "/products/available").send();
        expect(response.status).toBe(200);
        expect(JSON.parse(response.text)).toEqual(listOfProducts.filter(p => p.quantity > 0));
        expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledWith(undefined, undefined, undefined)

    })

})