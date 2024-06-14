import express, { Router } from "express"
import ErrorHandler from "../helper"
import { body, CustomValidator, param, query } from "express-validator"
import ProductController from "../controllers/productController"
import Authenticator from "./auth"
import { Product } from "../components/product"
import { request } from "http"
import ProductDAO from "../dao/productDAO"
import { group } from "console"

/**
 * Represents a class that defines the routes for handling proposals.
 */
class ProductRoutes {
    private controller: ProductController
    private router: Router
    private errorHandler: ErrorHandler
    private authenticator: Authenticator

    /**
     * Constructs a new instance of the ProductRoutes class.
     * @param {Authenticator} authenticator - The authenticator object used for authentication.
     */
    constructor(authenticator: Authenticator) {
        this.authenticator = authenticator
        this.controller = new ProductController()
        this.router = express.Router()
        this.errorHandler = new ErrorHandler()
        this.initRoutes()
    }

    /**
     * Returns the router instance.
     * @returns The router instance.
     */
    getRouter(): Router {
        return this.router
    }

    /**
     * Initializes the routes for the product router.
     * 
     * @remarks
     * This method sets up the HTTP routes for handling product-related operations such as registering products, registering arrivals, selling products, retrieving products, and deleting products.
     * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
     * 
     */
    initRoutes() {

        const productDAO = new ProductDAO();

        const productExists : CustomValidator = async (value) => {
            const productExists = await productDAO.getAllProducts("model", null, value);
            if(productExists.length === 0)
                throw new Error("Model doesn't exists"); 
        }

        /**
         * Route for registering the arrival of a set of products.
         * It requires the user to be logged in and to be either an admin or a manager.
         * It requires the following parameters:
         * - model: string. It cannot be empty and it cannot be repeated in the database.
         * - category: string (one of "Smartphone", "Laptop", "Appliance")
         * - quantity: number. It must be greater than 0.
         * - details: string. It can be empty.
         * - sellingPrice: number. It must be greater than 0.
         * - arrivalDate: string. It can be omitted. If present, it must be a valid date in the format YYYY-MM-DD that is not after the current date
         * It returns a 200 status code if the arrival was registered successfully.
         */
        this.router.post(
            "/",
            this.authenticator.isLoggedIn,
            this.authenticator.isManager,
            body("model").isString().isLength({min: 1}).withMessage("Model cannot be empty"),
            body("category").isString().isIn(["Smartphone", "Laptop", "Appliance"]).withMessage("Category need to be in: Smartphone, Laptop, Appliance"),
            body("quantity").isInt({min: 1}).isInt().withMessage("Quantity need to be numeric greather than 0"),
            body("details").isString().isLength({min: 1}).withMessage("Details need to be a string"),
            body("sellingPrice").isInt({min: 1}).withMessage("Selling price need to be a number greather than 0"),
            body("arrivalDate").optional().if((value: string) => value !== null).isDate({ format: "YYYY-MM-DD", strictMode: true }),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => this.controller.registerProducts(req.body.model, req.body.category, req.body.quantity, req.body.details, req.body.sellingPrice, req.body.arrivalDate)
                .then(() => res.status(200).end())
                .catch((err) => next(err))
        )

        /**
         * Route for registering the increase in quantity of a product.
         * It requires the user to be logged in and to be either an admin or a manager.
         * It requires the product model as a request parameter. The model must be a string and cannot be empty, and it must represent an existing product.
         * It requires the following body parameters:
         * - quantity: number. It must be greater than 0. This number represents the increase in quantity, to be added to the existing quantity.
         * - changeDate: string. It can be omitted. If present, it must be a valid date in the format YYYY-MM-DD that is not after the current date and is after the arrival date of the product.
         * It returns the new quantity of the product.
         */
        this.router.patch(
            "/:model",
            this.authenticator.isLoggedIn,
            this.authenticator.isManager,
            param("model").isString().isLength({min: 1}),
            body("quantity").isInt({min: 1}),
            body("changeDate").optional().if((value: string) => (value !== null && (value !== ""))).isDate({ format: "YYYY-MM-DD", strictMode: true }),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => this.controller.changeProductQuantity(req.params.model, req.body.quantity, req.body.changeDate)
                .then((quantity: any /**number */) => res.status(200).json({ quantity: quantity }))
                .catch((err) => next(err))
        )

        /**
         * Route for selling a product.
         * It requires the user to be logged in and to be either an admin or a manager.
         * It requires the product model as a request parameter. The model must be a string and cannot be empty, and it must represent an existing product.
         * It requires the following body parameters:
         * - quantity: number. It must be greater than 0. This number represents the quantity of units sold. It must be less than or equal to the available quantity of the product.
         * - sellingDate: string. It can be omitted. If present, it must be a valid date in the format YYYY-MM-DD that is not after the current date and is after the arrival date of the product.
         * It returns the new quantity of the product.
         */
        this.router.patch(
            "/:model/sell",
            this.authenticator.isLoggedIn,
            this.authenticator.isManager,
            param("model").isString().isLength({min: 1}),
            body("quantity").isInt({min:1}),
            body("sellingDate").optional().if((value: string) => value !== null).isDate({ format: "YYYY-MM-DD", strictMode: true }),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => this.controller.sellProduct(req.params.model, req.body.quantity, req.body.sellingDate)
                .then((quantity: any /**number */) => res.status(200).json({ quantity: quantity }))
                .catch((err) => {
                    console.log(err)
                    next(err)
                })
        )

        /**
         * Route for retrieving all products.
         * It requires the user to be logged in and to be either an admin or a manager
         * It can have the following optional query parameters:
         * - grouping: string. It can be either "category" or "model". If absent, then all products are returned and the other query parameters must also be absent.
         * - category: string. It can only be present if grouping is equal to "category" (in which case it must be present) and, when present, it must be one of "Smartphone", "Laptop", "Appliance".
         * - model: string. It can only be present if grouping is equal to "model" (in which case it must be present and not empty).
         * It returns an array of Product objects.
         */
        this.router.get(
            "/",
            this.authenticator.isLoggedIn,
            this.authenticator.isAdminOrManager,
            query("grouping").if(query("grouping").exists({checkNull: true})).isString().isIn(["category", "model", ""]),
            query("category").if(query("grouping").equals("category")).isString().notEmpty(),
            query("model").if(query("grouping").equals("model")).isString().notEmpty(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => this.controller.getProducts(req.query.grouping, req.query.category, req.query.model)
                .then((products: any /*Product[]*/) => res.status(200).json(products))
                .catch((err) => {
                    console.log(err)
                    next(err)
                })
        )

        /**
         * Route for retrieving all available products.
         * It requires the user to be logged in.
         * It can have the following optional query parameters:
         * - grouping: string. It can be either "category" or "model". If absent, then all products are returned and the other query parameters must also be absent.
         * - category: string. It can only be present if grouping is equal to "category" (in which case it must be present) and, when present, it must be one of "Smartphone", "Laptop", "Appliance".
         * - model: string. It can only be present if grouping is equal to "model" (in which case it must be present and not empty).
         * It returns an array of Product objects.
         */
        this.router.get(
            "/available",
            this.authenticator.isLoggedIn,
            this.authenticator.isCustomer,
            query("grouping").if(query("grouping").exists({checkNull: true})).isString().isIn(["category", "model", ""]),
            query("category").if(query("grouping").equals("category")).isString().notEmpty(),
            query("model").if(query("grouping").equals("model")).isString().notEmpty(),
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => this.controller.getAvailableProducts(req.query.grouping, req.query.category, req.query.model)
                .then((products: any/*Product[]*/) => res.status(200).json(products))
                .catch((err) => next(err))
        )

        /**
         * Route for deleting all products.
         * It requires the user to be logged in and to be either an admin or a manager.
         * It returns a 200 status code.
         */
        this.router.delete(
            "/",
            this.authenticator.isLoggedIn,
            this.authenticator.isAdminOrManager,
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => this.controller.deleteAllProducts()
                .then(() => res.status(200).end())
                .catch((err: any) => next(err))
        )

        /**
         * Route for deleting a product.
         * It requires the user to be logged in and to be either an admin or a manager.
         * It requires the product model as a request parameter. The model must be a string and cannot be empty, and it must represent an existing product.
         * It returns a 200 status code.
         */
        this.router.delete(
            "/:model",
            this.authenticator.isLoggedIn,
            this.authenticator.isAdminOrManager,
            param("model").isString().isLength({min: 1}).custom(productExists),
            (req: any, res: any, next: any) => this.controller.deleteProduct(req.params.model)
                .then(() => res.status(200).end())
                .catch((err: any) => next(err))
        )


    }
}

export default ProductRoutes