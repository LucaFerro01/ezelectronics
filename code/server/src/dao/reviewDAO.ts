
/**
 * A class that implements the interaction with the database for all review-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */

import { User } from "../components/user";
import { ExistingReviewError, NoReviewProductError } from "../errors/reviewError";
import { ProductNotFoundError } from "../errors/productError";
import db from "../db/db"


class ReviewDAO {
    newReview(model: string, userId: User, score: number, comment: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            db.get('SELECT * FROM Products WHERE model = ? ', [model], (err: Error, product: any) => {
                if (err)
                    return reject(err);
                if (!product)
                    return reject(new ProductNotFoundError());

                db.get('SELECT * FROM Reviews WHERE model = ? AND userId = ?', [model, userId], (err: Error, review: any) => {
                    if (err)
                        return reject(err);
                    if (review)
                        return reject(new ExistingReviewError());

                    const query = 'INSERT INTO Reviews (model, userId, score, comment, date) VALUES (?, ?, ?, ?, DATE("now"))';
                    db.run(query, [model, userId, score, comment], (err: Error) => {
                        if (err)
                            return reject(err);
                        resolve();
                    });
                });
            });
        });
    }

    returnReviews(model: string): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            db.get('SELECT * FROM Products WHERE model = ?', [model], (err: Error | null, product: any) => {
                if (err)
                    return reject(err);
                if (!product)
                    return reject(new ProductNotFoundError());

                const query = 'SELECT * FROM Reviews WHERE model = ?';
                db.all(query, [model], (err: Error | null, res: any[]) => {
                    if (err)
                        return reject(err);
                    resolve(res);
                });
            });
        });
    }

    deleteReview(model: string, userId: User): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            db.get('SELECT * FROM Products WHERE model = ?', [model], (err: Error | null, product: any) => {
                if (err)
                    return reject(err);
                if (!product)
                    return reject(new ProductNotFoundError());

                db.get('SELECT * FROM Reviews WHERE model = ? AND userId = ?', [model, userId], (err: Error | null, review: any) => {
                    if (err)
                        return reject(err);
                    if (!review)
                        return reject(new NoReviewProductError());
                    
                    const query = 'DELETE FROM Reviews WHERE model = ? AND userId = ?';
                    db.run(query, [model, userId], (err: Error | null) => {
                        if (err)
                            return reject(err);
                        resolve();
                    });
                });
            });
        });
    }

    deleteAllReviewsProduct(model: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            db.get('SELECT * FROM Products WHERE model = ?', [model], (err: Error | null, product: any) => {
                if (err)
                    return reject(err);
                if (!product)
                    return reject(new ProductNotFoundError());

                const query = 'DELETE FROM Reviews WHERE model = ?';
                db.run(query, [model], (err: Error | null) => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
        });
    }

    deleteAllReviews(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const query = 'DELETE FROM Reviews';
            db.run(query, (err: Error | null) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }

    //check if a product exists
    productExists(model: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = 'SELECT COUNT(*) as count FROM Products WHERE model = ?';
            db.get(sql, [model], (err: Error | null, row: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count > 0);
                }
            });
        });
    }

    //check if a user made a review
    reviewDone(model: string, user: User): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = 'SELECT COUNT(*) as count FROM Reviews WHERE model = ? AND userId = ?';
            db.get(sql, [model, user], (err: Error | null, row: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count > 0);
                }
            });
        });
    }

}
export default ReviewDAO;