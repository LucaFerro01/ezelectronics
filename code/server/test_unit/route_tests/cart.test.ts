import { test, expect, jest, describe } from "@jest/globals";
import request from "supertest";
import { app } from "../../index";

import CartController from "../../src/controllers/cartController";
import { Cart, ProductInCart } from "../../src/components/cart";
import { Category } from "../../src/components/product";
import Authenticator from "../../src/routers/auth";

jest.mock("../../src/controllers/cartController");
jest.mock("../../src/routers/auth");

const baseURL = "/ezelectronics/carts";

describe("CartRouter unit tests", () => {
    const mockModel = "iPhone13";
    const mockCart = new Cart("johndoe", false, "", 1700, [
        new ProductInCart(mockModel, 2, Category.SMARTPHONE, 800),
        new ProductInCart("iPhone14", 1, Category.SMARTPHONE, 900),
    ]);

    describe("GET /", () => {
        test("It should return 200", async () => {
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((_req, _res, next) => {
                return next();
            });
            jest.spyOn(CartController.prototype, "getCart").mockResolvedValueOnce(mockCart);

            const res = await request(app).get(baseURL);
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockCart);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalled();
        });

        test("It should return 401 if not a customer", async () => {
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((_req, res, _next) => {
                return res.status(401).json({ error: "Unauthorized" });
            });
            jest.spyOn(CartController.prototype, "getCart").mockResolvedValueOnce(mockCart);
            const res = await request(app).get(baseURL);
            expect(res.statusCode).toBe(401);
        });
    });

    describe("POST /", () => {
        test("It should return 200", async () => {
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((_req, _res, next) => {
                return next();
            });
            jest.spyOn(CartController.prototype, "addToCart").mockResolvedValueOnce(true);

            const res = await request(app).post(baseURL).send({ model: mockModel });
            expect(res.statusCode).toBe(200);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalled();
        });

        test("It should return 401 if not a customer", async () => {
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((_req, res, _next) => {
                return res.status(401).json({ error: "Unauthorized" });
            });
            jest.spyOn(CartController.prototype, "addToCart").mockResolvedValueOnce(true);
            const res = await request(app).post(baseURL).send({ model: mockModel });
            expect(res.statusCode).toBe(401);
        });
    });

    describe("PATCH /", () => {
        test("It should return 200", async () => {
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((_req, _res, next) => {
                return next();
            });
            jest.spyOn(CartController.prototype, "checkoutCart").mockResolvedValueOnce(true);

            const res = await request(app).patch(baseURL);
            expect(res.statusCode).toBe(200);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalled();
        });

        test("It should return 401 if not a customer", async () => {
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((_req, res, _next) => {
                return res.status(401).json({ error: "Unauthorized" });
            });
            jest.spyOn(CartController.prototype, "checkoutCart").mockResolvedValueOnce(true);
            const res = await request(app).patch(baseURL);
            expect(res.statusCode).toBe(401);
        });
    });

    describe("GET /history", () => {
        test("It should return 200", async () => {
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((_req, _res, next) => {
                return next();
            });
            jest.spyOn(CartController.prototype, "getCustomerCarts").mockResolvedValueOnce([mockCart]);

            const res = await request(app).get(baseURL + "/history");
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([mockCart]);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalled();
        });

        test("It should return 401 if not a customer", async () => {
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((_req, res, _next) => {
                return res.status(401).json({ error: "Unauthorized" });
            });
            jest.spyOn(CartController.prototype, "getCustomerCarts").mockResolvedValueOnce([mockCart]);
            const res = await request(app).get(baseURL + "/history");
            expect(res.statusCode).toBe(401);
        });
    });

    describe("DELETE /products/:model", () => {
        test("It should return 200", async () => {
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((_req, _res, next) => {
                return next();
            });
            jest.spyOn(CartController.prototype, "removeProductFromCart").mockResolvedValueOnce(true);

            const res = await request(app).delete(baseURL + "/products/" + mockModel);
            expect(res.statusCode).toBe(200);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalled();
        });

        test("It should return 401 if not a customer", async () => {
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((_req, res, _next) => {
                return res.status(401).json({ error: "Unauthorized" });
            });
            jest.spyOn(CartController.prototype, "removeProductFromCart").mockResolvedValueOnce(true);
            const res = await request(app).delete(baseURL + "/products/" + mockModel);
            expect(res.statusCode).toBe(401);
        });
    });

    describe("DELETE /current", () => {
        test("It should return 200", async () => {
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((_req, _res, next) => {
                return next();
            });
            jest.spyOn(CartController.prototype, "clearCart").mockResolvedValueOnce(true);

            const res = await request(app).delete(baseURL + "/current");
            expect(res.statusCode).toBe(200);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalled();
        });

        test("It should return 401 if not a customer", async () => {
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((_req, res, _next) => {
                return res.status(401).json({ error: "Unauthorized" });
            });
            jest.spyOn(CartController.prototype, "clearCart").mockResolvedValueOnce(true);
            const res = await request(app).delete(baseURL + "/current");
            expect(res.statusCode).toBe(401);
        });
    });

    describe("DELETE /", () => {
        test("It should return 200", async () => {
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((_req, _res, next) => {
                return next();
            });
            jest.spyOn(CartController.prototype, "deleteAllCarts").mockResolvedValueOnce(true);

            const res = await request(app).delete(baseURL);
            expect(res.statusCode).toBe(200);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalled();
        });

        test("It should return 401 if not an admin or manager", async () => {
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((_req, res, _next) => {
                return res.status(401).json({ error: "Unauthorized" });
            });
            jest.spyOn(CartController.prototype, "deleteAllCarts").mockResolvedValueOnce(true);
            const res = await request(app).delete(baseURL);
            expect(res.statusCode).toBe(401);
        });
    });

    describe("GET /all", () => {
        test("It should return 200", async () => {
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((_req, _res, next) => {
                return next();
            });
            jest.spyOn(CartController.prototype, "getAllCarts").mockResolvedValueOnce([mockCart]);

            const res = await request(app).get(baseURL + "/all");
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([mockCart]);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalled();
        });

        test("It should return 401 if not an admin or manager", async () => {
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((_req, res, _next) => {
                return res.status(401).json({ error: "Unauthorized" });
            });
            jest.spyOn(CartController.prototype, "getAllCarts").mockResolvedValueOnce([mockCart]);
            const res = await request(app).get(baseURL + "/all");
            expect(res.statusCode).toBe(401);
        });
    });
});
