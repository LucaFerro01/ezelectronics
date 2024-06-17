import { CartNotFoundError } from "../errors/cartError";
import { Cart, ProductInCart } from "../components/cart";
import db from "../db/db";

const sqlStatements = {
    createCart: "INSERT INTO carts (username, paid) VALUES (?, 0)",

    getCurrentCart: `SELECT c.paid, c.username, c.cartId, c.paymentDate, cp.model, cp.price, cp.category, cp.quantity
    FROM carts AS c
    LEFT JOIN cart_products AS cp
    ON c.cartId = cp.cartId
    WHERE c.username = ? AND c.paid = 0`,

    getCurrentCartId: "SELECT cartId FROM carts WHERE username = ? AND paid = 0",

    getPaidCart: `SELECT c.paid, c.username, c.cartId, c.paymentDate, cp.model, cp.price, cp.category, cp.quantity
    FROM carts AS c
    LEFT JOIN cart_products AS cp
    ON c.cartId = cp.cartId
    WHERE c.username = ? AND c.paid = 1`,

    getAllCarts: `SELECT c.cartId, c.username, c.paid, c.paymentDate, cp.model, cp.price, cp.category, cp.quantity
    FROM carts AS c
    LEFT JOIN cart_products AS cp
    ON c.cartId = cp.cartId`,

    addCartProduct: "INSERT INTO cart_products (cartId, model, price, category, quantity) VALUES (?, ?, ?, ?, 1)",

    updateCartToPaid: "UPDATE carts SET paid = 1, paymentDate = ? WHERE username = ? AND paid = 0",

    incrementCartProductQty: "UPDATE cart_products SET quantity = quantity + 1 WHERE cartId = ? AND model = ?",
    decrementCartProductQty: "UPDATE cart_products SET quantity = quantity - 1 WHERE cartId = ? AND model = ?",

    deleteAllCartProducts: `DELETE FROM cart_products
    WHERE cartId IN (
        SELECT c.cartId FROM carts AS c
        WHERE c.paid = 0 AND c.username = ?
    )`,

    clearCarts: "DELETE FROM carts",
    clearCartProducts: "DELETE FROM cart_products",
};

type DBCart = {
    cartId: number;
    cart: Cart;
};

/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {
    createCart(username: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            db.run(sqlStatements.createCart, [username], (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }
            });
            resolve(true);
        });
    }

    getCurrentCart(username: string): Promise<DBCart | null> {
        return new Promise<DBCart | null>((resolve, reject) => {
            db.all(sqlStatements.getCurrentCart, [username], (err: Error | null, rows: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (rows.length == 0) {
                    resolve(null);
                    return;
                }

                const cart = new Cart(username, false, null, 0, []);
                const cartId: number = rows[0].cartId;

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

                resolve({
                    cartId,
                    cart,
                });
            });
        });
    }

    private handleCartRows(rows: any): DBCart[] {
        const cartIds: number[] = [];
        const carts: Cart[] = [];

        let prevCartId = -1;
        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            if (!r) {
                continue;
            }

            if (r.cartId != prevCartId) {
                let paid = true;
                if (!r.paid) {
                    paid = false;
                }

                cartIds.push(r.cartId);
                carts.push(new Cart(r.username, paid, r.paymentDate, 0, []));
                prevCartId = r.cartId;
            }

            if (r.quantity <= 0) {
                continue;
            }

            carts[carts.length - 1].products.push(new ProductInCart(r.model, r.quantity, r.category, r.price));
            carts[carts.length - 1].total += r.price * r.quantity;
        }

        const dbCarts: DBCart[] = [];
        for (let i = 0; i < carts.length; i++) {
            dbCarts.push({
                cartId: cartIds[i],
                cart: carts[i],
            });
        }

        return dbCarts;
    }

    getPaidCarts(username: string): Promise<DBCart[]> {
        return new Promise<DBCart[]>((resolve, reject) => {
            db.all(sqlStatements.getPaidCart, [username], (err: Error | null, rows: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (rows.length == 0) {
                    resolve([]);
                    return;
                }

                resolve(this.handleCartRows(rows));
            });
        });
    }

    getAllCarts(): Promise<DBCart[]> {
        return new Promise<DBCart[]>((resolve, reject) => {
            db.all(sqlStatements.getAllCarts, (err: Error | null, rows: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (rows.length == 0) {
                    resolve([]);
                    return;
                }

                resolve(this.handleCartRows(rows));
            });
        });
    }

    addCartProduct(
        cartId: number,
        model: string,
        price: number,
        category: string,
        username?: string
    ): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (username) {
                db.get(sqlStatements.getCurrentCartId, [username], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    db.run(sqlStatements.addCartProduct, [row.cartId, model, price, category], (err: Error | null) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                    });
                    resolve(true);
                });
            }

            db.run(sqlStatements.addCartProduct, [cartId, model, price, category], (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }
            });
            resolve(true);
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

            db.run(sqlStatements.updateCartToPaid, [dateStr, username], (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }
            });
            resolve(true);
        });
    }

    incrementProductQty(cartId: number, model: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            db.run(sqlStatements.incrementCartProductQty, [cartId, model], (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }
            });
            resolve(true);
        });
    }

    decrementProductQty(cartId: number, model: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            db.run(sqlStatements.decrementCartProductQty, [cartId, model], (err: Error | null) => {
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
            db.run(sqlStatements.deleteAllCartProducts, [username], (err: Error | null) => {
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
            db.run(sqlStatements.clearCarts, (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }
            });
            resolve(true);
        });

        const cartProductsPromise = new Promise<boolean>((resolve, reject) => {
            db.run(sqlStatements.clearCartProducts, (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }
            });
            resolve(true);
        });

        return Promise.all([cartPromise, cartProductsPromise]);
    }
}

export default CartDAO;
