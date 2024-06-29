import express, { Router } from "express";
import ErrorHandler from "../helper";
import { body, param } from "express-validator";
import ReviewController from "../controllers/reviewController";
import Authenticator from "./auth";

class ReviewRoutes {
    private controller: ReviewController;
    private router: Router;
    private errorHandler: ErrorHandler;
    private authenticator: Authenticator;

    constructor(authenticator: Authenticator) {
        this.authenticator = authenticator;
        this.controller = new ReviewController();
        this.router = express.Router();
        this.errorHandler = new ErrorHandler();
        this.initRoutes();
    }

    getRouter(): Router {
        return this.router;
    }

    initRoutes() {
        this.router.post(
            "/:model",
            this.authenticator.isLoggedIn,
            this.authenticator.isCustomer,
            param('model').isString().notEmpty(),
            body('score').isInt({ min: 1, max: 5 }),
            body('comment').isString().notEmpty(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    await this.controller.addReview(req.params.model, req.user, req.body.score, req.body.comment);
                    res.status(200).send();
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.get(
            "/:model",
            this.authenticator.isLoggedIn,
            param('model').isString().notEmpty(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    const reviews = await this.controller.getProductReviews(req.params.model);
                    res.status(200).json(reviews);
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.delete(
            "/:model",
            this.authenticator.isLoggedIn,
            this.authenticator.isCustomer,
            param('model').isString().notEmpty(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    await this.controller.deleteReview(req.params.model, req.user);
                    res.status(200).send();
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.delete(
            "/:model/all",
            this.authenticator.isLoggedIn,
            this.authenticator.isAdminOrManager,
            param('model').isString().notEmpty(),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    await this.controller.deleteReviewsOfProduct(req.params.model);
                    res.status(200).send();
                } catch (err) {
                    next(err);
                }
            }
        );

        this.router.delete(
            "/",
            this.authenticator.isLoggedIn,
            this.authenticator.isAdminOrManager,
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    await this.controller.deleteAllReviews();
                    res.status(200).send();
                } catch (err) {
                    next(err);
                }
            }
        );
    }
}

export default ReviewRoutes;
