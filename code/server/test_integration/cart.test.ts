import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { app } from "../index";
import { cleanup } from "../src/db/cleanup";

const basePath = "/ezelectronics";
const cartPath = basePath + "/carts";

const customer = {
    username: "cart_customer",
    name: "customer",
    surname: "customer",
    password: "customer",
    role: "Customer",
};
const manager = { username: "cart_manager", name: "manager", surname: "manager", password: "manager", role: "Manager" };

const model0 = "cart_model_0";
const model1 = "cart_model_1";

const product0 = {
    model: model0,
    sellingPrice: 800,
    category: "Smartphone",
    details: "description",
    quantity: 10,
    arrivalDate: "2024-06-07",
};
const product1 = {
    model: model1,
    sellingPrice: 900,
    category: "Smartphone",
    details: "description",
    quantity: 1,
    arrivalDate: "2024-06-07",
};

let customerCookie: string;
let managerCookie: string;

const postUser = async (userInfo: any) => {
    await request(app).post(`${basePath}/users`).send(userInfo).expect(200);
};

const login = async (userInfo: any) => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`${basePath}/sessions`)
            .send(userInfo)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res.header["set-cookie"][0]);
            });
    });
};

const postProduct = async (productInfo: any, cookie: string) => {
    await request(app).post(`${basePath}/products`).set("Cookie", cookie).send(productInfo).expect(200);
};

describe("Cart routes integration tests", () => {
    beforeAll(async () => {
        // cleanup();

        await postUser(manager);
        managerCookie = await login(manager);
        await postUser(customer);
        customerCookie = await login(customer);

        await postProduct(product0, managerCookie);
        await postProduct(product1, managerCookie);
    });

    afterAll(() => {
        cleanup();
    });

    describe("GET /", () => {
        test("It should return 200 and an empty cart", async () => {
            const res = await request(app).get(cartPath).set("Cookie", customerCookie).expect(200);
            expect(res.body.products).toHaveLength(0);
            expect(res.body.paid).toBe(false);
        });

        test("It should return 200 and a cart", async () => {
            await request(app).post(cartPath).set("Cookie", customerCookie).send({ model: model0 }).expect(200);
            const res = await request(app).get(cartPath).set("Cookie", customerCookie).expect(200);
            expect(res.body.products).toHaveLength(1);
        });
    });

    describe("POST /", () => {
        test("It should return 200 and add a product to the cart", async () => {
            await request(app).post(cartPath).set("Cookie", customerCookie).send({ model: model1 }).expect(200);
            const res = await request(app).get(cartPath).set("Cookie", customerCookie).expect(200);
            expect(res.body.products).toHaveLength(2);
        });

        test("It should return 200 and increment the first product to 2", async () => {
            await request(app).post(cartPath).set("Cookie", customerCookie).send({ model: model0 }).expect(200);
            const res = await request(app).get(cartPath).set("Cookie", customerCookie).expect(200);
            expect(res.body.products[0].quantity).toBe(2);
        });

        test("It should return 404 because the product does not exist", async () => {
            await request(app)
                .post(cartPath)
                .set("Cookie", customerCookie)
                .send({ model: "non_existing_model" })
                .expect(404);
        });
    });

    describe("PATCH /", () => {
        test("It should return 200 and set the cart to paid", async () => {
            await request(app).patch(cartPath).set("Cookie", customerCookie).expect(200);
            const res = await request(app)
                .get(cartPath + "/history")
                .set("Cookie", customerCookie)
                .expect(200);
            expect(res.body[0].paid).toBe(true);
        });

        test("It should return 404 because there is no current cart", async () => {
            await request(app).patch(cartPath).set("Cookie", customerCookie).expect(404);
        });

        test("It should return 400 because the current cart has no products", async () => {
            await request(app).post(cartPath).set("Cookie", customerCookie).send({ model: model0 }).expect(200);
            await request(app).delete(`${cartPath}/products/${model0}`).set("Cookie", customerCookie).expect(200);
            await request(app).patch(cartPath).set("Cookie", customerCookie).expect(400);
        });

        test("It should return 409 because the quantity in stock of the product is lower then the required", async () => {
            await request(app).post(cartPath).set("Cookie", customerCookie).send({ model: model1 }).expect(200);
            await request(app).post(cartPath).set("Cookie", customerCookie).send({ model: model1 }).expect(200);
            await request(app).patch(cartPath).set("Cookie", customerCookie).expect(409);
        });
    });

    describe("GET /history", () => {
        test("It should return 200 and return the history of the customer", async () => {
            const res = await request(app)
                .get(cartPath + "/history")
                .set("Cookie", customerCookie)
                .expect(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].products).toHaveLength(2);
        });
    });

    describe("DELETE /products/:model", () => {
        test("It should return 200 and remove the product from the cart", async () => {
            await request(app).delete(`${cartPath}/products/${model1}`).set("Cookie", customerCookie).expect(200);
            const res = await request(app).get(cartPath).set("Cookie", customerCookie).expect(200);
            expect(res.body.products).toHaveLength(1);
            expect(res.body.products[0].quantity).toBe(1);
        });

        test("It should return 404 because product is not in cart", async () => {
            await request(app).delete(`${cartPath}/products/${model0}`).set("Cookie", customerCookie).expect(404);
        });

        test("It should return 404 because the product does not exist", async () => {
            await request(app)
                .delete(`${cartPath}/products/non_existing_model`)
                .set("Cookie", customerCookie)
                .expect(404);
        });
    });

    describe("DELETE /current", () => {
        test("It should return 200 and remove the current cart", async () => {
            await request(app).post(cartPath).set("Cookie", customerCookie).send({ model: model0 }).expect(200);
            await request(app).delete(`${cartPath}/current`).set("Cookie", customerCookie).expect(200);
            const res = await request(app).get(cartPath).set("Cookie", customerCookie).expect(200);
            expect(res.body.products).toHaveLength(0);
        });
    });

    describe("GET /all", () => {
        test("It should return 200 and return all carts", async () => {
            const res = await request(app)
                .get(cartPath + "/all")
                .set("Cookie", managerCookie)
                .expect(200);
            expect(res.body).toHaveLength(2);
        });

        test("It should return 401 because is not manager or admin", async () => {
            await request(app)
                .get(cartPath + "/all")
                .set("Cookie", customerCookie)
                .expect(401);
        });
    });

    describe("DELETE /", () => {
        test("It should return 200 and remove all carts", async () => {
            await request(app).delete(cartPath).set("Cookie", managerCookie).expect(200);
            const res = await request(app).get(cartPath).set("Cookie", customerCookie).expect(200);
            expect(res.body.products).toHaveLength(0);
        });

        test("It should return 401 because is not manager or admin", async () => {
            await request(app).delete(cartPath).set("Cookie", customerCookie).expect(401);
        });
    });
});
