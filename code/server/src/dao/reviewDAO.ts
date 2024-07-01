import { User } from "../components/user";
import { ExistingReviewError, NoReviewProductError } from "../errors/reviewError";
import { ProductNotFoundError } from "../errors/productError";
import db from "../db/db";
import { ProductReview } from "../components/review";

class ReviewDAO {
    newReview(model: string, user: User, score: number, comment: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            db.get('SELECT * FROM Products WHERE model = ?', [model], (err: Error, product: any) => {
                if (err) return reject(err);
                if (!product) return reject(new ProductNotFoundError());

                db.get('SELECT * FROM Reviews WHERE model = ? AND userId = ?', [model, user.username], (err: Error, review: any) => {
                    if (err) return reject(err);
                    if (review) return reject(new ExistingReviewError());

                    const query = 'INSERT INTO Reviews (model, userId, score, comment, date) VALUES (?, ?, ?, ?, DATE("now"))';
                    db.run(query, [model, user.username, score, comment], (err: Error) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            });
        });
    }

    returnReviews(model: string): Promise<ProductReview[]> {
        return new Promise<ProductReview[]>((resolve, reject) => {
            db.get('SELECT * FROM Products WHERE model = ?', [model], (err: Error | null, product: any) => {
                if (err) return reject(err);
                if (!product) return reject(new ProductNotFoundError());

                const query = 'SELECT * FROM Reviews WHERE model = ?';
                db.all(query, [model], (err: Error | null, res: any[]) => {
                    if (err) return reject(err);

                    const reviews = res.map(review => new ProductReview(review.model, review.userId, review.score, review.date, review.comment));
                    resolve(reviews);
                });
            });
        });
    }

    deleteReview(model: string, user: User): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            db.get('SELECT * FROM Products WHERE model = ?', [model], (err: Error | null, product: any) => {
                if (err) return reject(err);
                if (!product) return reject(new ProductNotFoundError());

                db.get('SELECT * FROM Reviews WHERE model = ? AND userId = ?', [model, user.username], (err: Error | null, review: any) => {
                    if (err) return reject(err);
                    if (!review) return reject(new NoReviewProductError());
                    
                    const query = 'DELETE FROM Reviews WHERE model = ? AND userId = ?';
                    db.run(query, [model, user.username], (err: Error | null) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            });
        });
    }

    deleteAllReviewsProduct(model: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            db.get('SELECT * FROM Products WHERE model = ?', [model], (err: Error | null, product: any) => {
                if (err) return reject(err);
                if (!product) return reject(new ProductNotFoundError());

                const query = 'DELETE FROM Reviews WHERE model = ?';
                db.run(query, [model], (err: Error | null) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        });
    }

    deleteAllReviews(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const query = 'DELETE FROM Reviews';
            db.run(query, (err: Error | null) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
}

export default ReviewDAO;
