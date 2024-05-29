import { CartNotFoundError } from "../errors/cartError";
import { Cart, ProductInCart } from "../components/cart";
import db from "../db/db";

/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {
    getCurrentCart(username: string): Promise<Cart | null> {
        return new Promise<Cart | null>((resolve, reject) => {
            const cart = new Cart(username, false, null, 0, []);

            const sql = `
            SELECT c.paid, c.username, c.cartId, c.paymentDate, cp.model, cp.price, cp.category, cp.quantity
            FROM carts AS c
            INNER JOIN cart_products AS cp
            ON c.cartId = cp.cartId
            WHERE c.username = ? AND c.paid = 0
            `;
            db.all(sql, [username], (err: Error | null, rows: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (rows.length == 0) {
                    resolve(null);
                    return;
                }

                const products: ProductInCart[] = [];
                let total = 0;
                for (let i = 0; i < rows.length; i++) {
                    const r = rows[i];
                    if (!r) {
                        continue;
                    }

                    if (r.quantity <= 0) {
                        continue;
                    }

                    products.push(new ProductInCart(r.model, r.quantity, r.category, r.price));
                    total += r.price * r.quantity;
                }

                cart.products = products;
                cart.total = total;
            });

            resolve(cart);
        });
    }

    getPaidCarts(username: string): Promise<Cart[]> {
        return new Promise<Cart[]>((resolve, reject) => {
            const carts: Cart[] = [];

            const sql = `
            SELECT c.paid, c.username, c.cartId, c.paymentDate, cp.model, cp.price, cp.category, cp.quantity
            FROM carts AS c
            INNER JOIN cart_products AS cp
            ON c.cartId = cp.cartId
            WHERE c.username = ? AND c.paid = 1
            `;
            db.all(sql, [username], (err: Error | null, rows: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (rows.length == 0) {
                    return;
                }

                let prevCartId = -1;
                let products: ProductInCart[] = [];
                let total = 0;
                for (let i = 0; i < rows.length; i++) {
                    const r = rows[i];
                    if (!r) {
                        continue;
                    }

                    if (r.cartId != prevCartId) {
                        carts[carts.length - 1].products = products;
                        carts[carts.length - 1].total = total;

                        let paid = true;
                        if (!r.paid) {
                            paid = false;
                        }

                        carts.push(new Cart(r.username, paid, r.paymentDate, 0, []));
                        products = [];
                        total = 0;
                        prevCartId = r.cartId;
                    }

                    if (r.quantity <= 0) {
                        continue;
                    }

                    products.push(new ProductInCart(r.model, r.quantity, r.category, r.price));
                    total += r.price * r.quantity;
                }
            });

            resolve(carts);
        });
    }

    createCart(username: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "INSERT INTO carts (username, paid) VALUES (?, 0)";
            db.run(sql, [username], (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }
            });
            resolve(true);
        });
    }

    addCartProduct(username: string, model: string, price: number, category: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let cartId: number;

            const cartIdSQL = `SELECT c.cartId FROM carts WHERE c.username = ? AND c.paid = 0`;
            db.get(cartIdSQL, [username], (err: Error | null, row: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!row) {
                    reject(new CartNotFoundError());
                    return;
                }

                cartId = row.cartId;
            });

            const sql = "INSERT INTO cart_products (cartId, model, price, category, quantity) VALUES (?, ?, ?, ?, 1)";
            db.run(sql, [cartId, model, price, category], (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }
            });
            resolve(true);
        });
    }

    getAllCarts(): Promise<Cart[]> {
        return new Promise<Cart[]>((resolve, reject) => {
            const carts: Cart[] = [];

            const sql = `
            SELECT c.cartId, c.username, c.paid, c.paymentDate, cp.model, cp.price, cp.category, cp.quantity
            FROM carts AS c
            INNER JOIN cart_products AS cp
            ON c.cartId = cp.cartId
            `;
            db.all(sql, (err: Error | null, rows: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (rows.length == 0) {
                    return;
                }

                let prevCartId = -1;
                let products: ProductInCart[] = [];
                let total = 0;
                for (let i = 0; i < rows.length; i++) {
                    const r = rows[i];
                    if (!r) {
                        continue;
                    }

                    if (r.cartId != prevCartId) {
                        carts[carts.length - 1].products = products;
                        carts[carts.length - 1].total = total;

                        let paid = true;
                        if (!r.paid) {
                            paid = false;
                        }

                        carts.push(new Cart(r.username, paid, r.paymentDate, 0, []));
                        products = [];
                        total = 0;
                        prevCartId = r.cartId;
                    }

                    if (r.quantity <= 0) {
                        continue;
                    }

                    products.push(new ProductInCart(r.model, r.quantity, r.category, r.price));
                    total += r.price * r.quantity;
                }
            });

            resolve(carts);
        });
    }

    updateCartToPaid(username: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const date = new Date();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const dateStr = `${date.getFullYear()}-${month.toLocaleString("en-US", {
                minimumIntegerDigits: 2,
                useGrouping: false,
            })}-${day.toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false })}`;

            const sql = "UPDATE carts SET paid = 1, paymentDate = ? WHERE username = ? AND paid = 0";
            db.run(sql, [dateStr, username], (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }
            });
            resolve(true);
        });
    }

    deleteAllCartProducts(username: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = `
            DELETE cp FROM cart_products AS cp
            INNER JOIN carts AS c
            ON cp.cartId = c.cartId
            WHERE c.username = ? AND c.paid = 0
            `;
            db.run(sql, [username], (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }
            });
            resolve(true);
        });
    }

    deleteAllCarts(): Promise<boolean[]> {
        const cartPromise = new Promise<boolean>((resolve, reject) => {
            const sql = "DELETE FROM carts";
            db.run(sql, (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }
            });
            resolve(true);
        });

        const cartProductsPromise = new Promise<boolean>((resolve, reject) => {
            const sql = "DELETE FROM cart_products";
            db.run(sql, (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }
            });
            resolve(true);
        });

        return Promise.all([cartPromise, cartProductsPromise]);
    }

    decrementProductQty(username: string, model: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = `
            UPDATE cart_products AS cp SET quantity = quantity - 1
            FROM carts AS c
            WHERE c.username = ? AND cp.model = ? AND c.cartId = cp.cartId AND c.paid = 0
            `;
            db.run(sql, [username, model], (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }
            });
            resolve(true);
        });
    }

    incrementProductQty(username: string, model: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = `
            UPDATE cart_products AS cp SET quantity = quantity + 1
            FROM carts AS c
            WHERE c.username = ? AND cp.model = ? AND c.cartId = cp.cartId AND c.paid = 0
            `;
            db.run(sql, [username, model], (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }
            });
            resolve(true);
        });
    }
}

export default CartDAO;
