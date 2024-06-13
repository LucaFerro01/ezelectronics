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
const menager = { username: "menager", name: "menager", surname: "menager", password: "menager", role: "Menager" }
// Cookie to keep user logged in
let customerCookie : string
let adminCookie : string
let menagerCookie : string

// Product for testing the API
const testProduct1 = new Product(1000, "LG Gram", Category.LAPTOP, "2024-06-13", "Light PC", 2);
const testProduct2 = new Product(50, "IDK", Category.APPLIANCE, null, "Idk what is it an appliance", 0);
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
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`${baseURL}/sessions`)
            .send(userInfo)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res.header["set-cookie"][0])
            })
    })
}

describe("Integration test, with no error", () => {

    // Before all test clean the test DB, create an Admin user and a Customer user
    beforeAll(async () => {
        await cleanup();
        console.log(menager)
        await postUser(admin);
        await postUser(customer);
        await postUser(menager);
        adminCookie = await login({username : admin.username, password : admin.password});
        customerCookie = await login({username : customer.username, password : customer.password});
        menagerCookie = await login({username : menager.username, password : menager.password});
    })
    
    // When conclude all the tests clean the test DB
    afterAll(async () => {
        await cleanup();
    })

    test("Return 200 status code if the product is correctly register", async () => {
        // check the return status code for the product registration
        await request(app).post(baseURL + "/product").set("Cookie", menagerCookie).send(testProduct1).expect(200);

    })
})
