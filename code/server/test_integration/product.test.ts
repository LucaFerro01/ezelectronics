import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from 'supertest';
import { app } from "../index"; // Assuming app is exported from index.js
import { cleanup } from "../src/db/cleanup";
import ProductDAO from "../src/dao/productDAO";
import UserDAO from "../src/dao/userDAO";
import { User, Role } from "../src/components/user";
import { beforeEach } from "node:test";
import { log } from "node:console";
import { Category, Product } from "../src/components/product";

const baseURL = "/ezelectronics";

// User for testing the API 
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }
const manager = { username: "manager", name: "manager", surname: "manager", password: "manager", role: "Manager" }
// Cookie to keep user logged in
let customerCookie : string
let adminCookie : string
let managerCookie : string

// Product for testing the API
const testProduct1 = new Product(1000, "LG Gram", Category.LAPTOP, "2024-06-13", "Light PC", 2);
const testProduct2 = new Product(50, "IDK", Category.APPLIANCE, null, "Idk what is it an appliance", 1);
const testProduct3 = new Product(300, "Asus ROG 1", Category.SMARTPHONE, null, "Gaming phone", 1)

// Function to create new user -> is a inBound test
const postUser = async (userInfo: any) => {
    await request(app)
        .post(`${baseURL}/users`)
        .send(userInfo)
        .expect(200)
}

// Function to logs in a user, and return the cookie -> inBound test
const login = async (userInfo: any) => {
   const userResponse = await request(app).post(`${baseURL}/sessions`).send(userInfo);
   const sessionID = userResponse.headers['set-cookie'];
   return sessionID;
}

describe("Integration test, with no error", () => {

    // Before all test clean the test DB, create an Admin user and a Customer user
    beforeAll(async () => {
        await cleanup();
        await postUser(admin);
        await postUser(customer);
        await postUser(manager);
        adminCookie = await login({username : admin.username, password : admin.password});
        customerCookie = await login({username : customer.username, password : customer.password});
        managerCookie = await login({username : manager.username, password : manager.password});
        console.log(managerCookie)
    })
    
    // When conclude all the tests clean the test DB
    afterAll(async () => {
        await cleanup();
    })

    test("Return 200 status code if the product is correctly register", async () => {
        // check the return status code for the product registration
        await request(app).post(baseURL + "/products").set("Cookie", managerCookie).send(testProduct1).expect(200);
        await request(app).post(baseURL + "/products").set("Cookie", managerCookie).send(testProduct2).expect(200);
    })

    test("Return 200 status code and the new add quantity of the model", async () => {
        const testAdd = {
            quantity : 1,
            changeDate : ""
        }
        const newQty = await request(app).patch(baseURL + "/products/" + testProduct2.model).set("Cookie", managerCookie).send(testAdd).expect(200);
        expect(JSON.parse(newQty.text)["quantity"]).toBe(testProduct2.quantity + testAdd.quantity);
    })

    test("Return 200 status code and the new sold quantity of the model", async () => {
        const testSold = {
            quantity : 1,
            sellingDate : "2024-06-14"
        }
        const soldQty = await request(app).patch(baseURL + "/products/" + testProduct1.model + "/sell").set("Cookie", managerCookie).send(testSold).expect(200);
        expect(JSON.parse(soldQty.text)["quantity"]).toBe(testProduct1.quantity - testSold.quantity);
    })

    test("Return 200 status code and the array of all the products", async () => {
        await cleanup();
        await postUser(manager);
        managerCookie = await login({username : manager.username, password : manager.password});
        await request(app).post(baseURL + "/products").set("Cookie", managerCookie).send(testProduct1).expect(200);
        await request(app).post(baseURL + "/products").set("Cookie", managerCookie).send(testProduct2).expect(200);
        const products = await request(app).get(baseURL + "/products/").set("Cookie", managerCookie).send().expect(200);
        expect(JSON.parse(products.text)[0]["model"]).toBe(testProduct1.model);
        expect(JSON.parse(products.text)[0]["category"]).toBe(testProduct1.category);
        expect(JSON.parse(products.text)[0]["sellingPrice"]).toBe(testProduct1.sellingPrice);
        expect(JSON.parse(products.text)[0]["arrivalDate"]).toBe(testProduct1.arrivalDate);
        expect(JSON.parse(products.text)[0]["details"]).toBe(testProduct1.details);
        expect(JSON.parse(products.text)[0]["quantity"]).toBe(testProduct1.quantity);
        expect(JSON.parse(products.text)[1]["model"]).toBe(testProduct2.model);
        expect(JSON.parse(products.text)[1]["category"]).toBe(testProduct2.category);
        expect(JSON.parse(products.text)[1]["sellingPrice"]).toBe(testProduct2.sellingPrice);
        expect(JSON.parse(products.text)[1]["arrivalDate"]).toBe(testProduct2.arrivalDate);
        expect(JSON.parse(products.text)[1]["details"]).toBe(testProduct2.details);
        expect(JSON.parse(products.text)[1]["quantity"]).toBe(testProduct2.quantity);
        //expect(JSON.parse(products.text)).toEqual(JSON.stringify([testProduct1, testProduct2]));
    })
})
