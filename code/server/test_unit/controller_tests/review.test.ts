import { test, expect, jest } from "@jest/globals"
import ReviewController from "../../src/controllers/reviewController"
import ReviewDAO from "../../src/dao/reviewDAO"
import { User, Role } from '../../src/components/user';

jest.mock("../../src/dao/reviewDAO")

test('addReview should call newReview on the DAO', async () => {
    const model = 'model1';
    const testUser = new User('username', 'giovanni', 'marangi', Role.CUSTOMER, 'address', 'birthdate');
    const score = 4;
    const comment = 'Great product!';

    jest.spyOn(ReviewDAO.prototype, "newReview").mockResolvedValueOnce();

    const controller = new ReviewController();
    const response = await controller.addReview(model, testUser, score, comment);

    expect(ReviewDAO.prototype.newReview).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.newReview).toHaveBeenCalledWith(model, testUser, score, comment);
  }
);

test('getProductReviews should call returnReviews on the DAO', async () => {
    const model = 'model1';

    jest.spyOn(ReviewDAO.prototype, "returnReviews").mockResolvedValueOnce([]);

    const controller = new ReviewController();
    const response = await controller.getProductReviews(model);

    expect(ReviewDAO.prototype.returnReviews).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.returnReviews).toHaveBeenCalledWith(model);
    expect(response).toEqual([]);
  }
);

test('deleteReview should call deleteReview on the DAO', async () => {
    const model = 'model1';
    const testUser = new User('username', 'giovanni', 'marangi', Role.CUSTOMER, 'address', 'birthdate');

    jest.spyOn(ReviewDAO.prototype, "deleteReview").mockResolvedValueOnce();

    const controller = new ReviewController();
    const response = await controller.deleteReview(model, testUser);

    expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledWith(model, testUser);
  }
);

test('deleteReviewsOfProduct should call deleteAllReviewsProduct on the DAO', async () => {
    const model = 'model1';

    jest.spyOn(ReviewDAO.prototype, "deleteAllReviewsProduct").mockResolvedValueOnce();

    const controller = new ReviewController();
    const response = await controller.deleteReviewsOfProduct(model);

    expect(ReviewDAO.prototype.deleteAllReviewsProduct).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.deleteAllReviewsProduct).toHaveBeenCalledWith(model);
  }
);

test('deleteAllReviews should call deleteAllReviews on the DAO', async () => {
    jest.spyOn(ReviewDAO.prototype, "deleteAllReviews").mockResolvedValueOnce();

    const controller = new ReviewController();
    const response = await controller.deleteAllReviews();

    expect(ReviewDAO.prototype.deleteAllReviews).toHaveBeenCalledTimes(1);
  }
);