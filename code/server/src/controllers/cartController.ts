import { CartNotFoundError, EmptyCartError, ProductNotInCartError } from "../errors/cartError";
import { User } from "../components/user";
import CartDAO from "../dao/cartDAO";
import { Cart } from "../components/cart";
import ProductDAO from "../dao/productDAO";
import { EmptyProductStockError, ProductNotFoundError } from "../errors/productError";

/**
 * Represents a controller for managing shopping carts.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class CartController {
    private cartDAO: CartDAO;
    private productDAO: ProductDAO;

    constructor() {
        this.cartDAO = new CartDAO();
        this.productDAO = new ProductDAO();
    }

    /**
     * Adds a product to the user's cart. If the product is already in the cart, the quantity should be increased by 1.
     * If the product is not in the cart, it should be added with a quantity of 1.
     * If there is no current unpaid cart in the database, then a new cart should be created.
     * @param user - The user to whom the product should be added.
     * @param model - The model of the product to add.
     * @returns A Promise that resolves to `true` if the product was successfully added.
     */
    async addToCart(user: User, model: string) /*: Promise<Boolean>*/ {
        try {
            const products = await this.productDAO.getAllProducts("model", null, model);
            if (products.length == 0) {
                throw new ProductNotFoundError();
            }
            const product = products[0];
            if (product.quantity == 0) {
                throw new EmptyProductStockError();
            }

            const dbCart = await this.cartDAO.getCurrentCart(user.username);
            if (!dbCart) {
                await this.cartDAO.createCart(user.username);
                await this.cartDAO.addCartProduct(0, model, product.sellingPrice, product.category, user.username);
                return true;
            }

            let foundProduct = false;
            for (let i = 0; i < dbCart.cart.products.length; i++) {
                if (dbCart.cart.products[i].model == model) {
                    foundProduct = true;
                    break;
                }
            }

            if (foundProduct) {
                await this.cartDAO.incrementProductQty(dbCart.cartId, model);
            } else {
                await this.cartDAO.addCartProduct(dbCart.cartId, model, product.sellingPrice, product.category);
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves the current cart for a specific user.
     * @param user - The user for whom to retrieve the cart.
     * @returns A Promise that resolves to the user's cart or an empty one if there is no current cart.
     */
    async getCart(user: User): Promise<Cart> {
        try {
            const dbCart = await this.cartDAO.getCurrentCart(user.username);
            if (!dbCart) {
                return new Cart(user.username, false, null, 0, []);
            }
            return dbCart.cart;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Checks out the user's cart. We assume that payment is always successful, there is no need to implement anything related to payment.
     * @param user - The user whose cart should be checked out.
     * @returns A Promise that resolves to `true` if the cart was successfully checked out.
     *
     */
    async checkoutCart(user: User) /**Promise<Boolean> */ {
        try {
            const dbCart = await this.cartDAO.getCurrentCart(user.username);
            if (!dbCart) {
                throw new CartNotFoundError();
            }

            const { cart } = dbCart;
            if (cart.products.length == 0) {
                throw new EmptyCartError();
            }

            const date = new Date();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const dateStr = `${date.getFullYear()}-${month.toLocaleString("en-US", {
                minimumIntegerDigits: 2,
                useGrouping: false,
            })}-${day.toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false })}`;

            for (const p of cart.products) {
                await this.productDAO.sellProduct(p.model, p.quantity, dateStr);
            }

            await this.cartDAO.updateCartToPaid(user.username);

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves all paid carts for a specific customer.
     * @param user - The customer for whom to retrieve the carts.
     * @returns A Promise that resolves to an array of carts belonging to the customer.
     * Only the carts that have been checked out should be returned, the current cart should not be included in the result.
     */
    async getCustomerCarts(user: User): Promise<Cart[]> {
        try {
            const dbCarts = await this.cartDAO.getPaidCarts(user.username);

            const carts: Cart[] = [];
            for (let i = 0; i < dbCarts.length; i++) {
                carts.push(dbCarts[i].cart);
            }

            return carts;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Removes one product unit from the current cart. In case there is more than one unit in the cart, only one should be removed.
     * @param user The user who owns the cart.
     * @param model The model of the product to remove.
     * @returns A Promise that resolves to `true` if the product was successfully removed.
     */
    async removeProductFromCart(user: User, model: string) /**Promise<Boolean> */ {
        try {
            const dbCart = await this.cartDAO.getCurrentCart(user.username);
            if (!dbCart) {
                throw new CartNotFoundError();
            }

            const { cart } = dbCart;
            let foundProduct = false;
            for (let i = 0; i < cart.products.length; i++) {
                if (cart.products[i].model == model) {
                    foundProduct = true;
                    break;
                }
            }
            if (!foundProduct) {
                throw new ProductNotInCartError();
            }

            const products = await this.productDAO.getAllProducts("model", null, model);
            if (products.length == 0) {
                throw new ProductNotFoundError();
            }

            await this.cartDAO.decrementProductQty(dbCart.cartId, model);

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Removes all products from the current cart.
     * @param user - The user who owns the cart.
     * @returns A Promise that resolves to `true` if the cart was successfully cleared.
     */
    async clearCart(user: User) /*:Promise<Boolean> */ {
        try {
            const dbCart = await this.cartDAO.getCurrentCart(user.username);
            if (!dbCart) {
                throw new CartNotFoundError();
            }
            await this.cartDAO.deleteAllCartProducts(user.username);
            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Deletes all carts of all users.
     * @returns A Promise that resolves to `true` if all carts were successfully deleted.
     */
    async deleteAllCarts() /**Promise<Boolean> */ {
        try {
            await this.cartDAO.deleteAllCarts();
            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves all carts in the database.
     * @returns A Promise that resolves to an array of carts.
     */
    async getAllCarts(): Promise<Cart[]> {
        try {
            const dbCarts = await this.cartDAO.getAllCarts();

            const carts: Cart[] = [];
            for (let i = 0; i < dbCarts.length; i++) {
                carts.push(dbCarts[i].cart);
            }

            return carts;
        } catch (error) {
            throw error;
        }
    }
}

export default CartController;
