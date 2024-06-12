import { test, expect, jest, beforeEach, describe, beforeAll } from "@jest/globals";
import ProductDAO from "../../src/dao/productDAO";
import ProductController from "../../src/controllers/productController";
import { Category, Product } from "../../src/components/product";

jest.mock("../../src/dao/productDAO");

describe("Product Controller", () => {
    let controller = new ProductController();
    let product : Product = new Product(200, "MacBook pro", Category.LAPTOP, null, "Good PC", 1);


    beforeAll(() => {
        jest.clearAllMocks();
    })

    test("Register product", async () => {
        const mockDAOinsertProduct = jest.spyOn(ProductDAO.prototype, "insertProduct").mockResolvedValueOnce(undefined);
        const registration = await controller.registerProducts(product.model, product.category, product.quantity, product.details, product.sellingPrice, product.arrivalDate);

        expect(mockDAOinsertProduct).toHaveBeenCalledTimes(1);
        expect(mockDAOinsertProduct).toHaveBeenCalledWith(product.model, product.category, product.quantity, product.details, product.sellingPrice, product.arrivalDate);
        expect(registration).toBe(undefined);
    })

    test("Change product quantity", async () => {
        let newQty = 3;
        const mockDAOchangeProductQuantity = jest.spyOn(ProductDAO.prototype, "changeProductQuantity").mockResolvedValueOnce(4);
        const changeProductQuantity = await controller.changeProductQuantity(product.model, newQty, null);

        expect(mockDAOchangeProductQuantity).toHaveBeenCalledTimes(1);
        expect(mockDAOchangeProductQuantity).toHaveBeenCalledWith(product.model, newQty, null);
        expect(changeProductQuantity).toBe(4); // product.quantity + newQty = 1 + 3
    })


})

