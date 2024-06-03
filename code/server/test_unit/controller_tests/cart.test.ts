import { test, expect, jest, describe } from "@jest/globals";
import CartDAO from "../../src/dao/cartDAO";
import CartController from "../../src/controllers/cartController";
import ProductDAO from "../../src/dao/productDAO";
import { Category, Product } from "../../src/components/product";
import { Role, User } from "../../src/components/user";
import { Cart, ProductInCart } from "../../src/components/cart";
import { EmptyProductStockError, LowProductStockError, ProductNotFoundError } from "../../src/errors/productError";
import { CartNotFoundError, EmptyCartError, ProductNotInCartError } from "../../src/errors/cartError";

jest.mock("../../src/dao/cartDAO");
jest.mock("../../src/dao/productDAO");

describe("CartController unit tests", () => {
    const controller = new CartController();

    const mockUsername = "johndoe";
    const mockUserCustomer = new User(mockUsername, "John", "Doe", Role.CUSTOMER, "", "");

    const mockModel0 = "iPhone13";
    const mockProduct0 = new Product(800, mockModel0, Category.SMARTPHONE, null, null, 10);
    const mockModel1 = "iPhone14";
    const mockProduct1 = new Product(900, mockModel1, Category.SMARTPHONE, null, null, 10);
    const mockNotInStock0 = new Product(800, mockModel0, Category.SMARTPHONE, null, null, 0);

    const mockCart = new Cart(mockUsername, false, "", 1700, [
        new ProductInCart(mockModel0, 2, Category.SMARTPHONE, 800),
        new ProductInCart(mockModel1, 1, Category.SMARTPHONE, 900),
    ]);

    describe("addToCart", () => {
        test("It should create a new cart, add the product to it, and return true", async () => {
            jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce(null);
            jest.spyOn(CartDAO.prototype, "createCart").mockResolvedValueOnce(true);
            jest.spyOn(CartDAO.prototype, "addCartProduct").mockResolvedValueOnce(true);
            jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([mockProduct0]);

            const res = await controller.addToCart(mockUserCustomer, mockModel0);
            expect(res).toBe(true);

            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalled();
            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(mockUsername);
            expect(CartDAO.prototype.createCart).toHaveBeenCalled();
            expect(CartDAO.prototype.createCart).toHaveBeenCalledWith(mockUsername);
            expect(CartDAO.prototype.addCartProduct).toHaveBeenCalled();
            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalled();
        });

        test("It should add the product to the existing cart and return true", async () => {
            jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce({
                cartId: 1,
                cart: new Cart(mockUsername, false, "", 800, [
                    new ProductInCart(mockModel0, 2, Category.SMARTPHONE, 800),
                ]),
            });
            jest.spyOn(CartDAO.prototype, "addCartProduct").mockResolvedValueOnce(true);
            jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([mockProduct1]);

            const res = await controller.addToCart(mockUserCustomer, mockModel1);
            expect(res).toBe(true);

            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalled();
            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(mockUsername);
            expect(CartDAO.prototype.addCartProduct).toHaveBeenCalled();
            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalled();
        });

        test("It should increment the quantity of the product and return true", async () => {
            jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce({
                cartId: 1,
                cart: new Cart(mockUsername, false, "", 800, [
                    new ProductInCart(mockModel0, 2, Category.SMARTPHONE, 800),
                ]),
            });
            jest.spyOn(CartDAO.prototype, "incrementProductQty").mockResolvedValueOnce(true);
            jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([mockProduct0]);

            const res = await controller.addToCart(mockUserCustomer, mockModel0);
            expect(res).toBe(true);

            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalled();
            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(mockUsername);
            expect(CartDAO.prototype.incrementProductQty).toHaveBeenCalled();
            expect(CartDAO.prototype.incrementProductQty).toBeCalledWith(mockUsername, mockModel0);
            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalled();
        });

        test("It should throw ProductNotFoundError", async () => {
            jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([]);
            await expect(controller.addToCart(mockUserCustomer, mockModel1)).rejects.toThrow(ProductNotFoundError);
            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalled();
        });

        test("It should throw EmptyProductStockError", async () => {
            jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([mockNotInStock0]);
            await expect(controller.addToCart(mockUserCustomer, mockModel0)).rejects.toThrow(EmptyProductStockError);
            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalled();
        });
    });

    describe("getCart", () => {
        test("It should return the cart of the user", async () => {
            jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce({
                cartId: 1,
                cart: mockCart,
            });

            const res = await controller.getCart(mockUserCustomer);
            expect(res).toEqual(mockCart);

            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalled();
            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(mockUsername);
        });

        test("It should return the default cart", async () => {
            jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce(null);

            const res = await controller.getCart(mockUserCustomer);
            expect(res.products.length).toBe(0);
            expect(res.total).toBe(0);

            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalled();
            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(mockUsername);
        });
    });

    describe("checkoutCart", () => {
        test("It should return true", async () => {
            jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce({ cartId: 1, cart: mockCart });
            jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([mockProduct0]);
            jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([mockProduct1]);
            jest.spyOn(CartDAO.prototype, "updateCartToPaid").mockResolvedValueOnce(true);

            const res = await controller.checkoutCart(mockUserCustomer);
            expect(res).toBe(true);

            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalled();
            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(mockUsername);
            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalled();
            expect(CartDAO.prototype.updateCartToPaid).toHaveBeenCalled();
            expect(CartDAO.prototype.updateCartToPaid).toHaveBeenCalledWith(mockUsername);
        });

        test("It should throw CartNotFoundError", async () => {
            jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce(null);
            await expect(controller.checkoutCart(mockUserCustomer)).rejects.toThrow(CartNotFoundError);
            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalled();
        });

        test("It should throw EmptyCartError", async () => {
            jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce({
                cartId: 1,
                cart: new Cart(mockUsername, false, "", 0, []),
            });
            await expect(controller.checkoutCart(mockUserCustomer)).rejects.toThrow(EmptyCartError);
            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalled();
        });

        test("It should throw EmptyProductStockError", async () => {
            jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce({ cartId: 1, cart: mockCart });
            jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([mockNotInStock0]);

            await expect(controller.checkoutCart(mockUserCustomer)).rejects.toThrow(EmptyProductStockError);

            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalled();
            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(mockUsername);
            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalled();
        });

        test("It should throw LowProductStockError", async () => {
            jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce({ cartId: 1, cart: mockCart });
            jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([
                new Product(800, mockModel0, Category.SMARTPHONE, null, null, 1),
            ]);

            await expect(controller.checkoutCart(mockUserCustomer)).rejects.toThrow(LowProductStockError);

            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalled();
            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(mockUsername);
            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalled();
        });
    });

    describe("getCustomerCarts", () => {
        test("It should return the paid carts of the user", async () => {
            jest.spyOn(CartDAO.prototype, "getPaidCarts").mockResolvedValueOnce([
                {
                    cartId: 1,
                    cart: new Cart(mockUsername, true, "", 0, []),
                },
                {
                    cartId: 2,
                    cart: new Cart(mockUsername, true, "", 0, []),
                },
            ]);

            const res = await controller.getCustomerCarts(mockUserCustomer);
            expect(res.length).toEqual(2);

            expect(CartDAO.prototype.getPaidCarts).toHaveBeenCalled();
            expect(CartDAO.prototype.getPaidCarts).toHaveBeenCalledWith(mockUsername);
        });
    });

    describe("removeProductFromCart", () => {
        test("It should return true", async () => {
            jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce({ cartId: 1, cart: mockCart });
            jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([mockProduct0]);
            jest.spyOn(CartDAO.prototype, "decrementProductQty").mockResolvedValueOnce(true);

            const res = await controller.removeProductFromCart(mockUserCustomer, mockModel0);
            expect(res).toBe(true);

            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalled();
            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(mockUsername);
            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalled();
            expect(CartDAO.prototype.decrementProductQty).toHaveBeenCalled();
            expect(CartDAO.prototype.decrementProductQty).toHaveBeenCalledWith(mockUsername, mockModel0);
        });

        test("It should throw ProductNotInCartError", async () => {
            jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce({ cartId: 1, cart: mockCart });
            await expect(controller.removeProductFromCart(mockUserCustomer, "")).rejects.toThrow(ProductNotInCartError);
            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalled();
        });

        test("It should throw ProductNotFoundError", async () => {
            jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce({ cartId: 1, cart: mockCart });
            jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([]);

            await expect(controller.removeProductFromCart(mockUserCustomer, mockModel1)).rejects.toThrow(
                ProductNotFoundError
            );

            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalled();
            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(mockUsername);
            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalled();
        });

        test("It should throw CartNotFoundError", async () => {
            jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce(null);
            await expect(controller.removeProductFromCart(mockUserCustomer, mockModel0)).rejects.toThrow(
                CartNotFoundError
            );
            expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalled();
        });
    });

    describe("clearCart", () => {
        test("It should return true", async () => {
            jest.spyOn(CartDAO.prototype, "deleteAllCartProducts").mockResolvedValueOnce(true);
            const res = await controller.clearCart(mockUserCustomer);
            expect(res).toBe(true);
            expect(CartDAO.prototype.deleteAllCartProducts).toHaveBeenCalled();
        });
    });

    describe("getAllCarts", () => {
        test("It should return all carts", async () => {
            jest.spyOn(CartDAO.prototype, "getAllCarts").mockResolvedValueOnce([
                {
                    cartId: 1,
                    cart: new Cart(mockUsername, false, "", 0, []),
                },
                {
                    cartId: 2,
                    cart: new Cart(mockUsername, false, "", 0, []),
                },
            ]);
            const res = await controller.getAllCarts();
            expect(res.length).toEqual(2);
            expect(CartDAO.prototype.getAllCarts).toHaveBeenCalled();
        });
    });
});
