import { User } from "../components/user";
import ReviewDAO from "../dao/reviewDAO";
import { ProductReview } from "../components/review";

class ReviewController {
    private dao: ReviewDAO;

    constructor() {
        this.dao = new ReviewDAO();
    }

    async addReview(model: string, user: User, score: number, comment: string): Promise<void> {
        return this.dao.newReview(model, user, score, comment);
    }

    async getProductReviews(model: string): Promise<ProductReview[]> {
        return this.dao.returnReviews(model);
    }

    async deleteReview(model: string, user: User): Promise<void> {
        return this.dao.deleteReview(model, user);
    }

    async deleteReviewsOfProduct(model: string): Promise<void> {
        return this.dao.deleteAllReviewsProduct(model);
    }

    async deleteAllReviews(): Promise<void> {
        return this.dao.deleteAllReviews();
    }
}

export default ReviewController;
