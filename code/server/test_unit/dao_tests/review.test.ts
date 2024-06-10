import { describe, test, expect, beforeAll, beforeEach, afterAll, afterEach, jest } from "@jest/globals"

import ReviewDAO from '../../src/dao/reviewDAO';
import { User, Role } from '../../src/components/user';
import { ExistingReviewError, NoReviewProductError } from '../../src/errors/reviewError';
import { ProductNotFoundError } from '../../src/errors/productError';
import db from '../../src/db/db';
import { Database } from "sqlite3";

jest.mock('../../src/db/db');

describe('ReviewDAO', () => {
    let dao: ReviewDAO;
    let user: User;

    beforeAll(() => {
        dao = new ReviewDAO();
        user = new User('user1', 'John', 'Doe', Role.CUSTOMER, '', '');
        const model = 'model1';
        const score = 4;
        const comment = 'Great product!';
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('newReview should add a review to the database', async () => {
        const mockDbGet1 = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { modelP: params[0] }); // Prodotto esiste
            return {} as Database;
        });

        const mockDbGet2 = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, null); // Nessuna review esistente
            return {} as Database;
        });

        const mockDbRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null); // Inserimento avvenuto con successo
            return {} as Database;
        });

        const result = await dao.newReview('model1', user, 5, 'Great product!');
        expect(result).toBeUndefined();
        expect(mockDbGet1).toHaveBeenCalledTimes(2); // Dovrebbe essere chiamato due volte
        expect(mockDbGet2).toHaveBeenCalledTimes(2); // Dovrebbe essere chiamato due volte
        expect(mockDbRun).toHaveBeenCalledTimes(1); // Dovrebbe essere chiamato una volta
        expect(mockDbRun).toHaveBeenCalledWith(
            'INSERT INTO Reviews (model, userId, score, comment, date) VALUES (?, ?, ?, ?, DATE("now"))',
            ['model1', user, 5, 'Great product!'],
            expect.any(Function)
        );
    });

    test("newReview should reject with an error if the product does not exist", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            const error = new ProductNotFoundError();
            callback(null, undefined) // product not found
            return {} as Database
        });

        await expect(dao.newReview('model2', user, 5, 'Great product!')).rejects.toThrowError(ProductNotFoundError);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(
            'SELECT * FROM Products WHERE model = ? ',
            ['model2'],
            expect.any(Function)
        );
    });

    test("newReview should reject with an error if the user has already reviewed the product", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            const error = new ExistingReviewError();
            callback(null, {}) // product found => user has already reviewed it
            return {} as Database
        });

        await expect(dao.newReview('model1', user, 5, 'Great product!')).rejects.toThrowError(ExistingReviewError);
        expect(mockDBGet).toHaveBeenCalledTimes(2);
        expect(mockDBGet).toHaveBeenCalledWith(
            'SELECT * FROM Reviews WHERE model = ? AND userId = ?',
            ['model1', user],
            expect.any(Function)
        );
    });

    test('newReview should reject with an error if there is an error checking the product', async () => {
        const errorMessage = 'Error checking product';
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(new Error(errorMessage));
            return {} as Database;
        });
    
        await expect(dao.newReview('model1', user, 5, 'Great product!')).rejects.toThrow(errorMessage);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
    });
    
    test('newReview should reject with an error if there is an error checking existing reviews', async () => {
        const errorMessage = 'Error checking reviews';
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { modelP: params[0] }); // Product exists
            return {} as Database;
        });
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(new Error(errorMessage));
            return {} as Database;
        });
    
        await expect(dao.newReview('model1', user, 5, 'Great product!')).rejects.toThrow(errorMessage);
        expect(mockDBGet).toHaveBeenCalledTimes(2);
    });
    
    test('newReview should reject with an error if there is an error inserting the review', async () => {
        const errorMessage = 'Error inserting review';
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { modelP: params[0] }); // Product exists
            return {} as Database;
        });
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, null); // No existing review
            return {} as Database;
        });
        const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(new Error(errorMessage));
            return {} as Database;
        });
    
        await expect(dao.newReview('model1', user, 5, 'Great product!')).rejects.toThrow(errorMessage);
        expect(mockDBRun).toHaveBeenCalledTimes(1);
    });
    

    test("returnReviews should return all reviews for a product from the database", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, {}) // product found
            return {} as Database
        });

        const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, [{}, {}])
            return {} as Database
        });

        const result = await dao.returnReviews('model1');
        expect(result).toEqual([{}, {}]);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(
            'SELECT * FROM Products WHERE model = ?',
            ['model1'],
            expect.any(Function)
        );
        expect(mockDBAll).toHaveBeenCalledTimes(1);
        expect(mockDBAll).toHaveBeenCalledWith(
            'SELECT * FROM Reviews WHERE model = ?',
            ['model1'],
            expect.any(Function)
        );
    });

    test("returnReviews should reject with an error if the product does not exist", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            const error = new ProductNotFoundError();
            callback(null, undefined) // product not found
            return {} as Database
        });

        await expect(dao.returnReviews('model2')).rejects.toThrowError(ProductNotFoundError);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(
            'SELECT * FROM Products WHERE model = ?',
            ['model2'],
            expect.any(Function)
        );
    });

    test('returnReviews should reject with an error if there is an error checking the product', async () => {
        const errorMessage = 'Error checking product';
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(new Error(errorMessage));
            return {} as Database;
        });
    
        await expect(dao.returnReviews('model1')).rejects.toThrow(errorMessage);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
    });
    
    test('returnReviews should reject with an error if there is an error fetching reviews', async () => {
        const errorMessage = 'Error fetching reviews';
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { modelP: params[0] }); // Product exists
            return {} as Database;
        });
        const mockDBAll = jest.spyOn(db, "all").mockImplementationOnce((sql, params, callback) => {
            callback(new Error(errorMessage));
            return {} as Database;
        });
    
        await expect(dao.returnReviews('model1')).rejects.toThrow(errorMessage);
        expect(mockDBAll).toHaveBeenCalledTimes(1);
    });
    

    test("deleteReview should delete a review from the database", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, {}) // product found
            return {} as Database
        });

        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        });

        const result = await dao.deleteReview('model1', user);
        expect(result).toBeUndefined();
        expect(mockDBGet).toHaveBeenCalledTimes(2);
        expect(mockDBGet).toHaveBeenCalledWith(
            'SELECT * FROM Products WHERE model = ?',
            ['model1'],
            expect.any(Function)
        );
        expect(mockDBRun).toHaveBeenCalledTimes(1);
        expect(mockDBRun).toHaveBeenCalledWith(
            'DELETE FROM Reviews WHERE model = ? AND userId = ?',
            ['model1', user],
            expect.any(Function)
        );
    });

    test("deleteReview should reject with an error if the product does not exist", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {

            const error = new ProductNotFoundError();
            callback(null, undefined) // product not found
            return {} as Database
        });

        await expect(dao.deleteReview('model2', user)).rejects.toThrowError(ProductNotFoundError);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(
            'SELECT * FROM Products WHERE model = ?',
            ['model2'],
            expect.any(Function)
        );
    });

    test("deleteReview should reject with an error if the user has not reviewed the product", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            if (sql.includes('SELECT * FROM Products WHERE model = ?')) {
                callback(null, {}); // Simulate product found
            } else if (sql.includes('SELECT * FROM Reviews WHERE model = ? AND userId = ?')) {
                callback(null, undefined); // Simulate review not found
            }
            return {} as Database; // Return an empty object to satisfy the return type
        });

        await expect(dao.deleteReview('model1', user)).rejects.toThrowError(NoReviewProductError);
        expect(mockDBGet).toHaveBeenCalledTimes(2);
        expect(mockDBGet).toHaveBeenCalledWith(
            'SELECT * FROM Reviews WHERE model = ? AND userId = ?',
            ['model1', user],
            expect.any(Function)
        );
    });


    test('deleteReview should reject with an error if there is an error checking the product', async () => {
        const errorMessage = 'Error checking product';
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(new Error(errorMessage));
            return {} as Database;
        });
    
        await expect(dao.deleteReview('model1', user)).rejects.toThrow(errorMessage);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
    });
    
    test('deleteReview should reject with an error if there is an error checking the review', async () => {
        const errorMessage = 'Error checking review';
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { modelP: params[0] }); // Product exists
            return {} as Database;
        });
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(new Error(errorMessage));
            return {} as Database;
        });
    
        await expect(dao.deleteReview('model1', user)).rejects.toThrow(errorMessage);
        expect(mockDBGet).toHaveBeenCalledTimes(2);
    });
    
    test('deleteReview should reject with an error if there is an error deleting the review', async () => {
        const errorMessage = 'Error deleting review';
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { modelP: params[0] }); // Product exists
            return {} as Database;
        });
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { review: params[1] }); // Review exists
            return {} as Database;
        });
        const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(new Error(errorMessage));
            return {} as Database;
        });
    
        await expect(dao.deleteReview('model1', user)).rejects.toThrow(errorMessage);
        expect(mockDBRun).toHaveBeenCalledTimes(1);
    });
    

    test("deleteAllReviewsProduct should delete all reviews for a product from the database", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, {}) // product found
            return {} as Database
        });

        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        });

        const result = await dao.deleteAllReviewsProduct('model1');
        expect(result).toBeUndefined();
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(
            'SELECT * FROM Products WHERE model = ?',
            ['model1'],
            expect.any(Function)
        );
        expect(mockDBRun).toHaveBeenCalledTimes(1);
        expect(mockDBRun).toHaveBeenCalledWith(
            'DELETE FROM Reviews WHERE model = ?',
            ['model1'],
            expect.any(Function)
        );
    });

    test("deleteAllReviewsProduct should reject with an error if the product does not exist", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            const error = new ProductNotFoundError();
            callback(null, undefined) // product not found
            return {} as Database
        });

        await expect(dao.deleteAllReviewsProduct('model2')).rejects.toThrowError(ProductNotFoundError);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(
            'SELECT * FROM Products WHERE model = ?',
            ['model2'],
            expect.any(Function)
        );
    });

    test('deleteAllReviewsProduct should reject with an error if there is an error checking the product', async () => {
        const errorMessage = 'Error checking product';
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(new Error(errorMessage));
            return {} as Database;
        });
    
        await expect(dao.deleteAllReviewsProduct('model1')).rejects.toThrow(errorMessage);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
    });
    
    test('deleteAllReviewsProduct should reject with an error if there is an error deleting reviews', async () => {
        const errorMessage = 'Error deleting reviews';
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { modelP: params[0] }); // Product exists
            return {} as Database;
        });
        const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(new Error(errorMessage));
            return {} as Database;
        });
    
        await expect(dao.deleteAllReviewsProduct('model1')).rejects.toThrow(errorMessage);
        expect(mockDBRun).toHaveBeenCalledTimes(1);
    });

    test("deleteAllReviews should delete all reviews from the database", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, ...params) => {
            const callback = params[params.length - 1];
            callback(null);
            return {} as Database;
        });

        await expect(dao.deleteAllReviews()).resolves.toBeUndefined();
        expect(mockDBRun).toHaveBeenCalledTimes(1);
        expect(mockDBRun).toHaveBeenCalledWith('DELETE FROM Reviews',
            expect.any(Function));
    });

    test('deleteAllReviews should reject with an error if there is an error deleting reviews', async () => {
        const errorMessage = 'Error deleting reviews';
        const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, callback) => {
            callback(new Error(errorMessage));
            return {} as Database;
        });
    
        await expect(dao.deleteAllReviews()).rejects.toThrow(errorMessage);
        expect(mockDBRun).toHaveBeenCalledTimes(1);
    });    

});