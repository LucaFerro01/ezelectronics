import { describe, test, expect, jest, beforeAll, afterEach, beforeEach, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"
import { ProductReview } from '../../src/components/review';
import { Product, Category } from "../../src/components/product"
import { validationResult } from "express-validator";
import ProductDAO from "../../src/dao/productDAO";
import UserDAO from "../../src/dao/userDAO";
import { cleanup } from "../../src/db/cleanup";
import { error } from "console";
import Authenticator from "../../src/routers/auth";
import ErrorHandler from "../../src/helper";
import Test from "supertest/lib/test";
import e from "express";
import ReviewController from "../../src/controllers/reviewController";
import ReviewDAO from "../../src/dao/reviewDAO";
import { ProductNotFoundError } from "../../src/errors/productError";
import { ExistingReviewError } from "../../src/errors/reviewError";
import { after, mock } from "node:test";

const baseURL = "/ezelectronics"
jest.mock("../../src/controllers/productController")

const userDao = new UserDAO();
const ProductDao = new ProductDAO();
let customerSessionId: any;
let adminSessionId: any;
let managerSessionId: any;

async function createUsers() {
    await userDao.createUser("customer", "test", "test", "test", "Customer")
    await userDao.createUser("admin", "test", "test", "test", "Admin")
    await userDao.createUser("manager", "test", "test", "test", "Manager")
}

beforeEach(async () => {
    await cleanup()
    await createUsers()
    jest.clearAllMocks();
    });

beforeAll(async () => {
   
        await cleanup()
        await createUsers()
        const customerResponse = await request(app).post(`${baseURL}/sessions`).send({
            username: "customer",
            password: "test"
        })
        const adminResponse = await request(app).post(`${baseURL}/sessions`).send({
            username: "admin",
            password: "test"
        })
        const managerResponse = await request(app).post(`${baseURL}/sessions`).send({
            username: "manager",
            password: "test"
        })
        customerSessionId = customerResponse.headers['set-cookie'];
        adminSessionId = adminResponse.headers['set-cookie'];
        managerSessionId = managerResponse.headers['set-cookie'];
    
});

afterEach(() => {
    jest.clearAllMocks();
});

afterAll(async () => {
    await cleanup();
});

describe('Review tests', () => {

    test('It should return a 200 success code if a review to a product is added', async () => {
        jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValueOnce(undefined);
        
        const currentDate = new Date().toISOString();

        const reviewTest = {
            model: 'model1',
            user: 'customer',
            score: 5,
            date: currentDate,
            comment: 'Great product!'
        };

        const response = await request(app).post(`${baseURL}/reviews/model1`).set('Cookie', customerSessionId).send(reviewTest);
        expect(response.status).toBe(200);
    });

    test('It should return a 422 error code if the score is not between 1 and 5', async () => {
        jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValueOnce(undefined);
        
        const currentDate = new Date().toISOString();

        const reviewTest = {
            model: 'model1',
            user: 'customer',
            score: 6,
            date: currentDate,
            comment: 'Great product!'
        };

        const response = await request(app).post(`${baseURL}/reviews/model1`).set('Cookie', customerSessionId).send(reviewTest);
        expect(response.status).toBe(422);
    });

    test('It should return a 422 error code if the model is an empty string', async () => {
        jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValueOnce(undefined);
        
        const currentDate = new Date().toISOString();

        const reviewTest = {
            model: '',
            user: 'customer',
            score: 6,
            date: currentDate,
            comment: 'Great product!'
        };

        const response = await request(app).post(`${baseURL}/reviews/model1`).set('Cookie', customerSessionId).send(reviewTest);
        expect(response.status).toBe(422);
    });


    test('It should return a 422 error code if the comment is an empty string', async () => {
        jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValueOnce(undefined);
        
        const currentDate = new Date().toISOString();

        const reviewTest = {
            model: 'model1',
            user: 'customer',
            score: 5,
            date: currentDate,
            comment: ''
        };

        const response = await request(app).post(`${baseURL}/reviews/model1`).set('Cookie', customerSessionId).send(reviewTest);
        expect(response.status).toBe(422);
    });

    test('It should return a 401 error code if the user is authenticated as manager', async () => {
        jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValueOnce(undefined);
        
        const currentDate = new Date().toISOString();

        const reviewTest = {
            model: 'model1',
            user: 'customer',
            score: 5,
            date: currentDate,
            comment: 'Great product!'
        };

        const response = await request(app).post(`${baseURL}/reviews/model1`).set('Cookie', managerSessionId).send(reviewTest);
        expect(response.status).toBe(401);
    });

    test('It should return a 401 error code if the user is authenticated as admin', async () => {
        jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValueOnce(undefined);
        
        const currentDate = new Date().toISOString();

        const reviewTest = {
            model: 'model1',
            user: 'customer',
            score: 5,
            date: currentDate,
            comment: 'Great product!'
        };

        const response = await request(app).post(`${baseURL}/reviews/model1`).set('Cookie', adminSessionId).send(reviewTest);
        expect(response.status).toBe(401);
    });

    test('It should return a 401 error code if the user is not authenticated', async () => {
        jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValueOnce(undefined);
        
        const currentDate = new Date().toISOString();

        const reviewTest = {
            model: 'model1',
            user: 'customer',
            score: 5,
            date: currentDate,
            comment: 'Great product!'
        };

        const response = await request(app).post(`${baseURL}/reviews/model1`).send(reviewTest);
        expect(response.status).toBe(401);
    });

    test('It should return a 200 success code if all reviews of a product are returned', async () => {
        jest.spyOn(ReviewController.prototype, "getProductReviews").mockResolvedValueOnce([]);

        const reviewTest = {
            model: 'model1',
        };

        const response = await request(app).get(`${baseURL}/reviews/model1`).set('Cookie', customerSessionId).send(reviewTest);
        expect(response.status).toBe(200);
    });

    test('It should return a 401 error code if the user is not authenticated', async () => {
        jest.spyOn(ReviewController.prototype, "getProductReviews").mockResolvedValueOnce([]);

        const reviewTest = {
            model: 'model1',
        };

        const response = await request(app).get(`${baseURL}/reviews/model1`).send(reviewTest);
        expect(response.status).toBe(401);
    });
    
    test('It should return a 200 succss code if a review is deleted', async () => {
        jest.spyOn(ReviewController.prototype, "deleteReview").mockResolvedValueOnce(undefined);
        
        const response = await request(app).delete(`${baseURL}/reviews/model1`).set('Cookie', customerSessionId);
        expect(response.status).toBe(200);
    });

    test('It should return a 401 error code if the user is not authenticated', async () => {
        jest.spyOn(ReviewController.prototype, "deleteReview").mockResolvedValueOnce(undefined);
        
        const response = await request(app).delete(`${baseURL}/reviews/model1`);
        expect(response.status).toBe(401);
    });

    test('It should return a 401 error code if the user is authenticated as admin', async () => {
        jest.spyOn(ReviewController.prototype, "deleteReview").mockResolvedValueOnce(undefined);
        
        const response = await request(app).delete(`${baseURL}/reviews/model1`).set('Cookie', adminSessionId);
        expect(response.status).toBe(401);
    });

    test('It should return a 401 error code if the user is authenticated as manager', async () => {
        jest.spyOn(ReviewController.prototype, "deleteReview").mockResolvedValueOnce(undefined);
        
        const response = await request(app).delete(`${baseURL}/reviews/model1`).set('Cookie', managerSessionId);
        expect(response.status).toBe(401);
    });

 /*    test("Database error return error 503", async () => {
        jest.spyOn(ReviewController.prototype, "deleteReview").mockRejectedValueOnce(new Error("Database error"));
        const response = await request(app).delete(`${baseURL}/reviews/`).set('Cookie', adminSessionId);
        expect(response.status).toBe(503);
    }); */



    test('It should return a 200 success code if all reviews of a product are deleted', async () => {
        jest.spyOn(ReviewController.prototype, "deleteReviewsOfProduct").mockResolvedValueOnce(undefined);
        
        const response = await request(app).delete(`${baseURL}/reviews/model1/all`).set('Cookie', adminSessionId);
        expect(response.status).toBe(200);
    });

    test('It should return a 401 error code if the user is not authenticated', async () => {
        jest.spyOn(ReviewController.prototype, "deleteReviewsOfProduct").mockResolvedValueOnce(undefined);
        
        const response = await request(app).delete(`${baseURL}/reviews/model1/all`);
        expect(response.status).toBe(401);
    });

    test('It should return a 401 error code if the user is authenticated as customer', async () => {
        jest.spyOn(ReviewController.prototype, "deleteReviewsOfProduct").mockResolvedValueOnce(undefined);
        
        const response = await request(app).delete(`${baseURL}/reviews/model1/all`).set('Cookie', customerSessionId);
        expect(response.status).toBe(401);
    });

/*     test("Database error return error 503", async () => {
        jest.spyOn(ReviewController.prototype, "deleteReviewsOfProduct").mockRejectedValueOnce(new Error("Database error"));
        const response = await request(app).delete(`${baseURL}/reviews/`).set('Cookie', adminSessionId);
        expect(response.status).toBe(503);
    });
 */

    test('It should return a 200 success code if all reviews are deleted', async () => {
        jest.spyOn(ReviewController.prototype, "deleteAllReviews").mockResolvedValueOnce(undefined);
        
        const response = await request(app).delete(`${baseURL}/reviews`).set('Cookie', adminSessionId);
        expect(response.status).toBe(200);
    });

    test('It should return a 401 error code if the user is not authenticated', async () => {
        jest.spyOn(ReviewController.prototype, "deleteAllReviews").mockResolvedValueOnce(undefined);
        
        const response = await request(app).delete(`${baseURL}/reviews`);
        expect(response.status).toBe(401);
    });

    test('It should return a 401 error code if the user is authenticated as customer', async () => {
        jest.spyOn(ReviewController.prototype, "deleteAllReviews").mockResolvedValueOnce(undefined);
        
        const response = await request(app).delete(`${baseURL}/reviews`).set('Cookie', customerSessionId);
        expect(response.status).toBe(401);
    });

});

afterAll(async () => {
    await cleanup();
});
