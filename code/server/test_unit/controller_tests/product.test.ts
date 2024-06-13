import { test, expect, jest, beforeEach, describe, beforeAll } from "@jest/globals";
import ProductDAO from "../../src/dao/productDAO";
import ProductController from "../../src/controllers/productController";
import { Category, Product } from "../../src/components/product";
import { execPath } from "process";

jest.mock("../../src/dao/productDAO");

describe("Product Controller", () => {
    let controller = new ProductController();
    let product : Product = new Product(1000, "MacBook pro", Category.LAPTOP, null, "Good PC", 1);
    let product2 : Product = new Product(400, "OnePlus nord", Category.SMARTPHONE, null, "Best buy phone", 0);


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

    test("Sell product", async () =>{
        const sellQty = 1;
        const mockDAOsellProduct = jest.spyOn(ProductDAO.prototype, "sellProduct").mockResolvedValueOnce(0);
        const sellProduct = await controller.sellProduct(product.model, sellQty, null);

        expect(mockDAOsellProduct).toHaveBeenCalledTimes(1);
        expect(mockDAOsellProduct).toHaveBeenCalledWith(product.model, sellQty, null);
        expect(sellProduct).toBe(0); // product.quantity - sellQty = 1 - 1
    })

    test("Get products", async () => {
        const mockDAOgetAllProducts = jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([product, product2]);
        const allProducts = await controller.getProducts(null, null, null);

        expect(mockDAOgetAllProducts).toHaveBeenCalledTimes(1);
        expect(mockDAOgetAllProducts).toHaveBeenCalledWith(null, null, null);
        expect(allProducts).toEqual([product, product2]);
    })

    test("Get available product", async () => {
        const mockDAOavailableProducts = jest.spyOn(ProductDAO.prototype, "availableProducts").mockResolvedValueOnce([product, product2].filter(p => p.quantity > 0));
        const availableProducts = await controller.getAvailableProducts(null, null, null);

        expect(mockDAOavailableProducts).toHaveBeenCalledTimes(1);
        expect(mockDAOavailableProducts).toHaveBeenCalledWith(null, null, null);
        expect(availableProducts).toEqual([product]) //only the product with qty > 0
    })

    test("Delete all products", async () => {
        const mockDAOdeleteAllProducts = jest.spyOn(ProductDAO.prototype, "deleteAllProducts").mockResolvedValueOnce(true);
        const deleteAllProducts = await controller.deleteAllProducts();

        expect(mockDAOdeleteAllProducts).toHaveBeenCalledTimes(1);
        expect(mockDAOdeleteAllProducts).toHaveBeenCalledWith();
        expect(deleteAllProducts).toBe(true);
    })

    test("Delete single product", async () => {
        const mockDAOdeleteProduct = jest.spyOn(ProductDAO.prototype, "deleteProduct").mockResolvedValueOnce(true);
        const deleteProduct = await controller.deleteProduct(product2.model);

        expect(mockDAOdeleteProduct).toHaveBeenCalledTimes(1);
        expect(mockDAOdeleteProduct).toHaveBeenCalledWith(product2.model);
        expect(deleteProduct).toBe(true);
    })

})

