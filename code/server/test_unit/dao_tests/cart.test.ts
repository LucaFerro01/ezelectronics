import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals";
import { Database } from "sqlite3";
import CartDAO from "../../src/dao/cartDAO";
import db from "../../src/db/db";
import { Category } from "../../src/components/product";
import { Cart, ProductInCart } from "../../src/components/cart";

jest.mock("../../src/db/db.ts");

describe("CartDAO unit tests", () => {
    const dao = new CartDAO();

    const mockUsername = "johndoe";
    const mockModel0 = "iPhone13";
    const mockModel1 = "iPhone14";

    const mockCurrCartRows = [
        {
            paid: 0,
            cartId: 2,
            category: Category.SMARTPHONE,
            model: mockModel0,
            price: 800,
            paymentDate: "",
            quantity: 1,
            username: mockUsername,
        },
        {
            paid: 0,
            cartId: 2,
            category: Category.SMARTPHONE,
            model: mockModel1,
            price: 900,
            paymentDate: "",
            quantity: 1,
            username: mockUsername,
        },
    ];

    const mockPaidCartRows = [
        {
            paid: 1,
            cartId: 1,
            category: Category.SMARTPHONE,
            model: mockModel0,
            price: 800,
            paymentDate: "2024-06-04",
            quantity: 1,
            username: mockUsername,
        },
        {
            paid: 1,
            cartId: 1,
            category: Category.SMARTPHONE,
            model: mockModel1,
            price: 900,
            paymentDate: "2024-06-04",
            quantity: 1,
            username: mockUsername,
        },
    ];

    describe("createCart", () => {
        test("It should return true", async () => {
            jest.spyOn(db, "run").mockImplementationOnce((_sql, _params, cb) => {
                cb(null);
                return {} as Database;
            });

            const res = await dao.createCart(mockUsername);
            expect(res).toBe(true);
        });

        test("It should reject", async () => {
            jest.spyOn(db, "run").mockImplementationOnce((_sql, _params, cb) => {
                cb(new Error());
                return {} as Database;
            });
            await expect(dao.createCart(mockUsername)).rejects.toThrow();
        });
    });

    describe("getCurrentCart", () => {
        test("It should return a cart", async () => {
            jest.spyOn(db, "all").mockImplementationOnce((_sql, _params, cb) => {
                cb(null, mockCurrCartRows);
                return {} as Database;
            });

            const res = await dao.getCurrentCart(mockUsername);
            expect(res?.cartId).toEqual(2);
            expect(res?.cart.total).toEqual(1700);
        });

        test("It should return null", async () => {
            jest.spyOn(db, "all").mockImplementationOnce((_sql, _params, cb) => {
                cb(null, []);
                return {} as Database;
            });

            const res = await dao.getCurrentCart(mockUsername);
            expect(res).toBeNull();
        });

        test("It should reject", async () => {
            jest.spyOn(db, "all").mockImplementationOnce((_sql, _params, cb) => {
                cb(new Error(), []);
                return {} as Database;
            });
            await expect(dao.getCurrentCart(mockUsername)).rejects.toThrow();
        });
    });

    describe("getPaidCarts", () => {
        test("It should return a list of carts", async () => {
            jest.spyOn(db, "all").mockImplementationOnce((_sql, _params, cb) => {
                cb(null, mockPaidCartRows);
                return {} as Database;
            });

            const res = await dao.getPaidCarts(mockUsername);
            expect(res.length).toEqual(1);
        });

        test("It should return an empty list", async () => {
            jest.spyOn(db, "all").mockImplementationOnce((_sql, _params, cb) => {
                cb(null, []);
                return {} as Database;
            });

            const res = await dao.getPaidCarts(mockUsername);
            expect(res.length).toEqual(0);
        });

        test("It should reject", async () => {
            jest.spyOn(db, "all").mockImplementationOnce((_sql, _params, cb) => {
                cb(new Error(), []);
                return {} as Database;
            });
            await expect(dao.getPaidCarts(mockUsername)).rejects.toThrow();
        });
    });

    describe("getAllCarts", () => {
        test("It should return a list of carts", async () => {
            jest.spyOn(db, "all").mockImplementationOnce((_sql, cb) => {
                cb(null, [...mockPaidCartRows, ...mockCurrCartRows]);
                return {} as Database;
            });

            const res = await dao.getAllCarts();
            expect(res.length).toEqual(2);
        });

        test("It should return an empty list", async () => {
            jest.spyOn(db, "all").mockImplementationOnce((_sql, cb) => {
                cb(null, []);
                return {} as Database;
            });

            const res = await dao.getAllCarts();
            expect(res.length).toEqual(0);
        });

        test("It should reject", async () => {
            jest.spyOn(db, "all").mockImplementationOnce((_sql, cb) => {
                cb(new Error(), []);
                return {} as Database;
            });
            await expect(dao.getAllCarts()).rejects.toThrow();
        });
    });

    describe("addCartProduct", () => {
        test("It should only use db.run because username is not passed and return true", async () => {
            jest.spyOn(db, "run").mockImplementationOnce((_sql, _params, cb) => {
                cb(null);
                return {} as Database;
            });

            const res = await dao.addCartProduct(1, mockModel0, 800, Category.SMARTPHONE);
            expect(res).toBe(true);
        });

        test("It should use db.get before db.run because username is provided and return true", async () => {
            jest.spyOn(db, "get").mockImplementationOnce((_sql, _params, cb) => {
                cb(null, { cartId: 1 });
                return {} as Database;
            });

            jest.spyOn(db, "run").mockImplementationOnce((_sql, _params, cb) => {
                cb(null);
                return {} as Database;
            });

            const res = await dao.addCartProduct(-1, mockModel0, 800, Category.SMARTPHONE, mockUsername);
            expect(res).toBe(true);
        });

        test("It should reject", async () => {
            jest.spyOn(db, "run").mockImplementationOnce((_sql, _params, cb) => {
                cb(new Error());
                return {} as Database;
            });
            await expect(dao.addCartProduct(1, mockModel0, 800, Category.SMARTPHONE)).rejects.toThrow();
        });
    });

    describe("updateCartToPaid", () => {
        test("It should return true", async () => {
            jest.spyOn(db, "run").mockImplementationOnce((_sql, _params, cb) => {
                cb(null);
                return {} as Database;
            });

            const res = await dao.updateCartToPaid(mockUsername);
            expect(res).toBe(true);
        });

        test("It should reject", async () => {
            jest.spyOn(db, "run").mockImplementationOnce((_sql, _params, cb) => {
                cb(new Error());
                return {} as Database;
            });
            await expect(dao.updateCartToPaid(mockUsername)).rejects.toThrow();
        });
    });

    describe("incrementProductQty", () => {
        test("It should return true", async () => {
            jest.spyOn(db, "run").mockImplementationOnce((_sql, _params, cb) => {
                cb(null);
                return {} as Database;
            });

            const res = await dao.incrementProductQty(mockUsername, mockModel0);
            expect(res).toBe(true);
        });

        test("It should reject", async () => {
            jest.spyOn(db, "run").mockImplementationOnce((_sql, _params, cb) => {
                cb(new Error());
                return {} as Database;
            });

            await expect(dao.incrementProductQty(mockUsername, mockModel0)).rejects.toThrow();
        });
    });

    describe("decrementProductQty", () => {
        test("It should return true", async () => {
            jest.spyOn(db, "run").mockImplementationOnce((_sql, _params, cb) => {
                cb(null);
                return {} as Database;
            });

            const res = await dao.decrementProductQty(mockUsername, mockModel0);
            expect(res).toBe(true);
        });

        test("It should reject", async () => {
            jest.spyOn(db, "run").mockImplementationOnce((_sql, _params, cb) => {
                cb(new Error());
                return {} as Database;
            });

            await expect(dao.decrementProductQty(mockUsername, mockModel0)).rejects.toThrow();
        });
    });

    describe("deleteAllCartProducts", () => {
        test("It should return true", async () => {
            jest.spyOn(db, "run").mockImplementationOnce((_sql, _params, cb) => {
                cb(null);
                return {} as Database;
            });

            const res = await dao.deleteAllCartProducts(mockUsername);
            expect(res).toBe(true);
        });

        test("It should reject", async () => {
            jest.spyOn(db, "run").mockImplementationOnce((_sql, _params, cb) => {
                cb(new Error());
                return {} as Database;
            });

            await expect(dao.deleteAllCartProducts(mockUsername)).rejects.toThrow();
        });
    });

    describe("deleteAllCarts", () => {
        test("It should return true", async () => {
            const mockRun = jest.spyOn(db, "run").mockImplementationOnce((_sql, cb) => {
                cb(null);
                return {} as Database;
            });

            const res = await dao.deleteAllCarts();
            expect(res).toStrictEqual([true, true]);

            mockRun.mockRestore();
        });

        test("It should reject", async () => {
            const mockRun = jest.spyOn(db, "run").mockImplementationOnce((_sql, cb) => {
                cb(new Error());
                return {} as Database;
            });

            await expect(dao.deleteAllCarts()).rejects.toThrow();

            mockRun.mockRestore();
        });
    });
});
