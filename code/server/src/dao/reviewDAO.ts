
/**
 * A class that implements the interaction with the database for all review-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */

import { User } from "../components/user";
import { ExistingReviewError, NoReviewProductError } from "../errors/reviewError";
import db from "../db/db"


class ReviewDAO {
    newReview(model: string, userId: User, score: number, comment: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            
            db.get('SELECT * FROM products WHERE modelP = ? ', [model], (err : Error, product: any) =>{
                if (err) return reject(err);
                if(!product) return reject(new Error('404: Product not found'));

                db.get('SELECT * FROM Reviews WHERE modelP = ? AND userId = ?', [model, userId], (err : Error, ExistingReview: any) => {
                    if (err) return reject(err);
                    if (ExistingReview) return reject(new ExistingReviewError());

                    const query = 'INSERT INTO Reviews (modelP, userId, score, comment, date) VALUES (?, ?, ?, ?, DATE("now"))';
                    db.run(query, [model, userId, score, comment], (err : Error) => {
                        if (err) return reject(err);
                        resolve(true);
                    });
                });
            });
        });
    }

    returnReviews (model: string ) : Promise<any[]>{
        return new Promise<any[]>((resolve, reject) => {
            db.get('SELECT * FROM Reviews WHERE modelP = ?', [model], (err: Error | null, reviewss: any) => {
                if(err) return reject (err);
                if (!reviewss) return reject(new Error('404: Product not found'));

                const query = 'SELECT * FROM Reviews WHERE modelP = ?';
                db.all(query, [model], (err:Error|null, res: any[]) => {
                    if(err) return reject(err);
                    resolve(res);
                });
            });
        });
    }

    deleteReview(model: string, userId: User): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            db.get('SELECT * FROM Products WHERE modelP = ?', [model], (err: Error | null, product: any) => {
                if (err) return reject(err);
                if (!product) return reject(new Error('404: Product not found'));

                db.get('SELECT * FROM Reviews WHERE modelP = ? AND userId = ?', [model, userId], (err: Error | null, review: any) => {
                    if (err) return reject(err);
                    if (!review) return reject(new NoReviewProductError());
                    const query = 'DELETE FROM Reviews WHERE modelP = ? AND userId = ?';
                    db.run(query, [model, userId], (err: Error | null) => {
                        if (err) return reject(err);
                        resolve(true);
                    });
                });
            });
        });
    }

    deleteAllReviewsProduct(model: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            db.get('SELECT * FROM products WHERE modelP = ?', [model], (err: Error | null, product: any) => {
                if (err) return reject(err);
                if (!product) return reject(new Error('404: Product not found'));

                const query = 'DELETE FROM reviews WHERE modelP = ?';
                db.run(query, [model], (err: Error | null) => {
                    if (err) return reject(err);
                    resolve(true);
                });
            });
        });
    }

    deleteAllReviews(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const query = 'DELETE FROM reviews';
            db.run(query, (err: Error | null) => {
                if (err) return reject(err);
                resolve(true);
            });
        });
    }

}
export default ReviewDAO;