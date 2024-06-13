import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from 'supertest';
import { app } from "../index"; // Assuming app is exported from index.js
import { cleanup } from "../src/db/cleanup";
import ProductDAO from "../src/dao/productDAO";
import UserDAO from "../src/dao/userDAO";
import { User, Role } from "../src/components/user";
import { beforeEach } from "node:test";
import { log } from "node:console";

const baseURL = "/ezelectronics";

// User for testing the API 
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }
// Cookie to keep user logged in
let customerCookie: string
let adminCookie: string

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

    // Before all test clean the test DB, create an Admin user an a Customer user
    beforeAll(async () => {
        await cleanup();
        await postUser(admin);
        await postUser(customer);
        adminCookie = await login(admin);
        customerCookie = await login(customer);
    })
    
    // When conclude all the tests clean the test DB
    afterAll(async () => {
        await cleanup();
    })
})
