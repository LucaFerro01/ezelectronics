import { Cart, ProductInCart } from "../components/cart"
import db from "../db/db"

/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {
    getCurrentCart(username: string): Promise<Cart> {
        return new Promise<Cart>(resolve=>{
            let cart = new Cart(username, false, null, 0, [])
            let cartId: number

            const cartSQL = "SELECT * FROM carts WHERE username = ? AND paid = 0"
            db.get(cartSQL, [username], (err: Error | null, row: any)=>{
                if (err){
                    throw err
                }

                if (!row) {
                    resolve(cart)
                }

                cartId = row.cart_id
            })

            const cartProductsSQL = "SELECT * FRON cart_products WHERE cart_id = ? AND quantity > 0"
            db.each(cartProductsSQL, [cartId], (err: Error | null, row: any)=>{
                if (err) {
                    throw err
                }

                if (row){
                    cart.total += row.price * row.quantity
                    cart.products.push(new ProductInCart(row.model, row.quantity, row.category, row.price))
                }
            })

            resolve(cart)
        })
    }
}

export default CartDAO